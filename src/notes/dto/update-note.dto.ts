import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateNoteDto {
  // Temporary until Supabase Auth guards provide the authenticated user.
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  title?: string | null;

  @IsOptional()
  @IsString()
  rawContent?: string;

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
