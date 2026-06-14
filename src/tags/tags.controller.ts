import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsService } from './tags.service';

@UseGuards(SupabaseAuthGuard)
@Controller()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post('tags')
  create(
    @Body() createTagDto: CreateTagDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tagsService.create(request.user.id, createTagDto);
  }

  @Get('tags')
  findAll(@Req() request: AuthenticatedRequest) {
    return this.tagsService.findAll(request.user.id);
  }

  @Patch('tags/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTagDto: UpdateTagDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tagsService.update(id, request.user.id, updateTagDto);
  }

  @Delete('tags/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.tagsService.remove(id, request.user.id);
  }

  @Post('notes/:noteId/tags/:tagId')
  addTagToNote(
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Param('tagId', ParseUUIDPipe) tagId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tagsService.addTagToNote(noteId, tagId, request.user.id);
  }

  @Delete('notes/:noteId/tags/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTagFromNote(
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Param('tagId', ParseUUIDPipe) tagId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.tagsService.removeTagFromNote(noteId, tagId, request.user.id);
  }

  @Get('notes/:noteId/tags')
  findTagsForNote(
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tagsService.findTagsForNote(noteId, request.user.id);
  }
}
