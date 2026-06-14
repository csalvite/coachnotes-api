import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

const toBoolean = (value: unknown) => {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
};

const toInteger = (value: unknown) =>
  typeof value === 'string' && value.trim() !== '' ? Number(value) : value;

const toDate = (value: unknown) =>
  typeof value === 'string' && value.trim() !== '' ? new Date(value) : value;

export class GetNotesQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sourceType?: string;

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @Transform(({ value }) => toDate(value))
  @IsDate()
  from?: Date;

  @IsOptional()
  @Transform(({ value }) => toDate(value))
  @IsDate()
  to?: Date;

  @IsOptional()
  @Transform(({ value }) => toInteger(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => toInteger(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
