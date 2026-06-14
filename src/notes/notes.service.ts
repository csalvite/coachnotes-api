import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { GetNotesQueryDto } from './dto/get-notes-query.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createNoteDto: CreateNoteDto) {
    const note = await this.prisma.notes.create({
      data: {
        user_id: userId,
        title: createNoteDto.title,
        raw_content: createNoteDto.rawContent,
        clean_content: createNoteDto.cleanContent,
        source_type: createNoteDto.sourceType,
        is_favorite: createNoteDto.isFavorite,
        is_archived: createNoteDto.isArchived,
      },
    });

    return this.toResponse(note);
  }

  async findAll(userId: string, query: GetNotesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildFindAllWhere(userId, query);

    const [notes, total] = await this.prisma.$transaction([
      this.prisma.notes.findMany({
        where,
        orderBy: {
          created_at: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notes.count({ where }),
    ]);

    return {
      data: notes.map((note) => this.toResponse(note)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const note = await this.findOwnedNoteOrThrow(id, userId);

    return this.toResponse(note);
  }

  async update(id: string, userId: string, updateNoteDto: UpdateNoteDto) {
    await this.findOwnedNoteOrThrow(id, userId);

    const data: Prisma.notesUpdateInput = {
      updated_at: new Date(),
    };

    if (updateNoteDto.title !== undefined) {
      data.title = updateNoteDto.title;
    }

    if (updateNoteDto.rawContent !== undefined) {
      data.raw_content = updateNoteDto.rawContent;
    }

    if (updateNoteDto.cleanContent !== undefined) {
      data.clean_content = updateNoteDto.cleanContent;
    }

    if (updateNoteDto.sourceType !== undefined) {
      data.source_type = updateNoteDto.sourceType;
    }

    if (updateNoteDto.isFavorite !== undefined) {
      data.is_favorite = updateNoteDto.isFavorite;
    }

    if (updateNoteDto.isArchived !== undefined) {
      data.is_archived = updateNoteDto.isArchived;
    }

    const note = await this.prisma.notes.update({
      where: { id },
      data,
    });

    return this.toResponse(note);
  }

  async remove(id: string, userId: string) {
    await this.findOwnedNoteOrThrow(id, userId);
    await this.prisma.notes.delete({
      where: { id },
    });
  }

  private async findOwnedNoteOrThrow(id: string, userId: string) {
    const note = await this.prisma.notes.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  private buildFindAllWhere(userId: string, query: GetNotesQueryDto) {
    const where: Prisma.notesWhereInput = {
      user_id: userId,
      is_archived: query.isArchived ?? false,
    };

    if (query.sourceType) {
      where.source_type = query.sourceType;
    }

    if (query.isFavorite !== undefined) {
      where.is_favorite = query.isFavorite;
    }

    if (query.from || query.to) {
      where.created_at = {
        gte: query.from,
        lte: query.to,
      };
    }

    const search = query.search?.trim();

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { raw_content: { contains: search, mode: 'insensitive' } },
        { clean_content: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private toResponse(note: Prisma.notesGetPayload<object>) {
    return {
      id: note.id,
      userId: note.user_id,
      title: note.title,
      rawContent: note.raw_content,
      cleanContent: note.clean_content,
      sourceType: note.source_type,
      isFavorite: note.is_favorite,
      isArchived: note.is_archived,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    };
  }
}
