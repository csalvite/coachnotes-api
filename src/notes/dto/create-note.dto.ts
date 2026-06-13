import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateNoteDto {
  // Temporary until Supabase Auth guards provide the authenticated user.
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  title?: string | null;

  @IsString()
  @IsNotEmpty()
  rawContent: string;

  @IsOptional()
  @IsString()
  cleanContent?: string | null;

  @IsOptional()
  @IsString()
  sourceType?: string;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
