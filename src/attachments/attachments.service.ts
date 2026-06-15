import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

type AttachmentType = 'IMAGE' | 'AUDIO' | 'VIDEO';
type TranscriptionResponse = { text?: unknown };

const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60;
const OPENAI_TRANSCRIPTION_MODEL = 'gpt-4o-transcribe';

interface AttachmentStorage {
  type: AttachmentType;
  bucket: string;
}

@Injectable()
export class AttachmentsService {
  private supabase?: SupabaseClient;

  constructor(private readonly prisma: PrismaService) {}

  async upload(noteId: string, userId: string, file?: Express.Multer.File) {
    await this.ensureOwnedNote(noteId, userId);

    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }

    const storage = this.resolveStorage(file.mimetype);
    const path = this.buildStoragePath(userId, noteId, file.originalname);

    const { error } = await this.getSupabase()
      .storage.from(storage.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException('Could not upload attachment');
    }

    const attachment = await this.prisma.note_attachments.create({
      data: {
        note_id: noteId,
        type: storage.type,
        url: path,
        file_name: file.originalname,
        mime_type: file.mimetype,
        file_size: BigInt(file.size),
        transcription_status: storage.type === 'AUDIO' ? 'PENDING' : undefined,
        metadata: {
          bucket: storage.bucket,
          path,
        },
      },
    });

    if (storage.type === 'AUDIO') {
      this.scheduleAudioTranscription(attachment.id);
    }

    return this.toResponse(attachment);
  }

  async processAudioTranscription(attachmentId: string) {
    const attachment = await this.prisma.note_attachments.findUnique({
      where: {
        id: attachmentId,
      },
    });

    if (!attachment || attachment.type !== 'AUDIO') {
      return;
    }

    try {
      await this.prisma.note_attachments.update({
        where: {
          id: attachment.id,
        },
        data: {
          transcription_status: 'PROCESSING',
        },
      });

      const audio = await this.downloadAudio(attachment);
      const transcription = await this.transcribeAudio(
        audio,
        attachment.file_name,
      );

      await this.prisma.note_attachments.update({
        where: {
          id: attachment.id,
        },
        data: {
          transcription,
          transcription_status: 'COMPLETED',
        },
      });
    } catch {
      await this.markTranscriptionFailed(attachmentId);
    }
  }

  async findAll(noteId: string, userId: string) {
    await this.ensureOwnedNote(noteId, userId);

    const attachments = await this.prisma.note_attachments.findMany({
      where: {
        note_id: noteId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return Promise.all(
      attachments.map(async (attachment) =>
        this.toResponse(attachment, await this.createSignedUrl(attachment)),
      ),
    );
  }

  async remove(noteId: string, attachmentId: string, userId: string) {
    await this.ensureOwnedNote(noteId, userId);

    const attachment = await this.prisma.note_attachments.findFirst({
      where: {
        id: attachmentId,
        note_id: noteId,
      },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    const bucket = this.bucketForType(attachment.type);
    const { error } = await this.getSupabase()
      .storage.from(bucket)
      .remove([attachment.url]);

    if (error) {
      throw new InternalServerErrorException('Could not delete attachment');
    }

    await this.prisma.note_attachments.delete({
      where: {
        id: attachment.id,
      },
    });
  }

  private async ensureOwnedNote(noteId: string, userId: string) {
    const note = await this.prisma.notes.findFirst({
      where: {
        id: noteId,
        user_id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }
  }

  private resolveStorage(mimeType: string): AttachmentStorage {
    if (mimeType.startsWith('image/')) {
      return { type: 'IMAGE', bucket: 'coachnotes-images' };
    }

    if (mimeType.startsWith('audio/')) {
      return { type: 'AUDIO', bucket: 'coachnotes-audio' };
    }

    if (mimeType.startsWith('video/')) {
      return { type: 'VIDEO', bucket: 'coachnotes-video' };
    }

    throw new BadRequestException('Unsupported attachment type');
  }

  private bucketForType(type: string) {
    if (type === 'IMAGE') {
      return 'coachnotes-images';
    }

    if (type === 'AUDIO') {
      return 'coachnotes-audio';
    }

    if (type === 'VIDEO') {
      return 'coachnotes-video';
    }

    throw new BadRequestException('Unsupported attachment type');
  }

  private buildStoragePath(userId: string, noteId: string, fileName: string) {
    return `${userId}/${noteId}/${randomUUID()}-${this.sanitizeFileName(fileName)}`;
  }

  private sanitizeFileName(fileName: string) {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
    return safeName || 'attachment';
  }

  private getSupabase() {
    if (this.supabase) {
      return this.supabase;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new InternalServerErrorException(
        'Supabase Storage is not configured',
      );
    }

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    return this.supabase;
  }

  private scheduleAudioTranscription(attachmentId: string) {
    setImmediate(() => {
      void this.processAudioTranscription(attachmentId).catch(() => undefined);
    });
  }

  private async downloadAudio(
    attachment: Prisma.note_attachmentsGetPayload<object>,
  ) {
    const { data, error } = await this.getSupabase()
      .storage.from(this.bucketForType(attachment.type))
      .download(attachment.url);

    if (error || !data) {
      throw new Error('Could not download audio attachment');
    }

    return data;
  }

  private async transcribeAudio(audio: Blob, fileName: string | null) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI is not configured');
    }

    const formData = new FormData();
    formData.append('model', OPENAI_TRANSCRIPTION_MODEL);
    formData.append('file', audio, fileName ?? 'audio');

    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error('OpenAI transcription failed');
    }

    const result = (await response.json()) as TranscriptionResponse;

    if (typeof result.text !== 'string') {
      throw new Error('OpenAI transcription response is invalid');
    }

    return result.text;
  }

  private async markTranscriptionFailed(attachmentId: string) {
    try {
      await this.prisma.note_attachments.update({
        where: {
          id: attachmentId,
        },
        data: {
          transcription_status: 'FAILED',
        },
      });
    } catch {
      return;
    }
  }

  private async createSignedUrl(
    attachment: Prisma.note_attachmentsGetPayload<object>,
  ) {
    try {
      const bucket = this.bucketForType(attachment.type);
      const { data, error } = await this.getSupabase()
        .storage.from(bucket)
        .createSignedUrl(attachment.url, SIGNED_URL_EXPIRES_IN_SECONDS);

      if (error) {
        return null;
      }

      return data.signedUrl;
    } catch {
      return null;
    }
  }

  private toResponse(
    attachment: Prisma.note_attachmentsGetPayload<object>,
    signedUrl: string | null = null,
  ) {
    return {
      id: attachment.id,
      noteId: attachment.note_id,
      type: attachment.type,
      path: attachment.url,
      signedUrl,
      fileName: attachment.file_name,
      mimeType: attachment.mime_type,
      fileSize: attachment.file_size ? Number(attachment.file_size) : null,
      transcription: attachment.transcription,
      transcriptionStatus: attachment.transcription_status,
      metadata: attachment.metadata,
      createdAt: attachment.created_at,
    };
  }
}
