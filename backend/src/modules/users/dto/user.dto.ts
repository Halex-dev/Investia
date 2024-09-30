import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsInt()
  @Min(1)
  @Max(28)
  @IsOptional()
  monthStartDay?: number;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsInt()
  @Min(1)
  @Max(28)
  @IsOptional()
  monthStartDay?: number;
}

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
