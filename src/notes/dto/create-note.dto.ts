import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
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
