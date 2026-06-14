import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttachmentsModule } from './attachments/attachments.module';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [AttachmentsModule, NotesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
