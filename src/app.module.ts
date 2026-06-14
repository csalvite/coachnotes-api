import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttachmentsModule } from './attachments/attachments.module';
import { NotesModule } from './notes/notes.module';
import { TagsModule } from './tags/tags.module';

@Module({
  imports: [AttachmentsModule, NotesModule, TagsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
