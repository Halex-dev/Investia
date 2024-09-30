import { IsString, IsHexColor, IsOptional, IsEnum } from 'class-validator';
import { CategoryType } from '../category.entity';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsHexColor()
  color: string;

  @IsEnum(CategoryType)
  @IsOptional()
  type?: CategoryType;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsHexColor()
  @IsOptional()
  color?: string;

  @IsEnum(CategoryType)
  @IsOptional()
  type?: CategoryType;
}
