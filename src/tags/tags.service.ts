import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createTagDto: CreateTagDto) {
    const tag = await this.prisma.tags.create({
      data: {
        user_id: userId,
        name: createTagDto.name,
        color: createTagDto.color,
      },
    });

    return this.toResponse(tag);
  }

  async findAll(userId: string) {
    const tags = await this.prisma.tags.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return tags.map((tag) => this.toResponse(tag));
  }

  async update(id: string, userId: string, updateTagDto: UpdateTagDto) {
    await this.findOwnedTagOrThrow(id, userId);

    const tag = await this.prisma.tags.update({
      where: { id },
      data: {
        name: updateTagDto.name,
        color: updateTagDto.color,
      },
    });

    return this.toResponse(tag);
  }

  async remove(id: string, userId: string) {
    await this.findOwnedTagOrThrow(id, userId);

    await this.prisma.$transaction([
      this.prisma.note_tags.deleteMany({
        where: {
          tag_id: id,
        },
      }),
      this.prisma.tags.delete({
        where: {
          id,
        },
      }),
    ]);
  }

  async addTagToNote(noteId: string, tagId: string, userId: string) {
    await this.findOwnedNoteOrThrow(noteId, userId);
    const tag = await this.findOwnedTagOrThrow(tagId, userId);

    await this.prisma.note_tags.upsert({
      where: {
        note_id_tag_id: {
          note_id: noteId,
          tag_id: tagId,
        },
      },
      create: {
        note_id: noteId,
        tag_id: tagId,
      },
      update: {},
    });

    return this.toResponse(tag);
  }

  async removeTagFromNote(noteId: string, tagId: string, userId: string) {
    await this.findOwnedNoteOrThrow(noteId, userId);
    await this.findOwnedTagOrThrow(tagId, userId);

    await this.prisma.note_tags.deleteMany({
      where: {
        note_id: noteId,
        tag_id: tagId,
      },
    });
  }

  async findTagsForNote(noteId: string, userId: string) {
    await this.findOwnedNoteOrThrow(noteId, userId);

    const noteTags = await this.prisma.note_tags.findMany({
      where: {
        note_id: noteId,
        tags: {
          user_id: userId,
        },
      },
      include: {
        tags: true,
      },
      orderBy: {
        tags: {
          name: 'asc',
        },
      },
    });

    return noteTags.map((noteTag) => this.toResponse(noteTag.tags));
  }

  private async findOwnedNoteOrThrow(noteId: string, userId: string) {
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

    return note;
  }

  private async findOwnedTagOrThrow(tagId: string, userId: string) {
    const tag = await this.prisma.tags.findFirst({
      where: {
        id: tagId,
        user_id: userId,
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  private toResponse(tag: Prisma.tagsGetPayload<object>) {
    return {
      id: tag.id,
      userId: tag.user_id,
      name: tag.name,
      color: tag.color,
      createdAt: tag.created_at,
    };
  }
}
