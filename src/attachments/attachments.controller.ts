import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AttachmentsService } from './attachments.service';

@UseGuards(SupabaseAuthGuard)
@Controller('notes/:noteId/attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    }),
  )
  upload(
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.attachmentsService.upload(noteId, request.user.id, file);
  }

  @Get()
  findAll(
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.attachmentsService.findAll(noteId, request.user.id);
  }

  @Delete(':attachmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.attachmentsService.remove(noteId, attachmentId, request.user.id);
  }
}
