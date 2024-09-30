import { IsNumber, IsString, IsEnum, IsDate, IsBoolean, IsOptional, Min } from 'class-validator';
import { TransactionType } from '../transaction.entity';
import { Decimal } from 'decimal.js';

export class CreateTransactionDto {
  @IsNumber()
  amount: Decimal;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsDate()
  date: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  categoryId: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsString()
  @IsOptional()
  recurringFrequency?: string;

  @IsBoolean()
  @IsOptional()
  isAmortized?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(2)
  amortizationMonths?: number;
}

export class UpdateTransactionDto {
  @IsNumber()
  @IsOptional()
  amount?: Decimal;

  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @IsDate()
  @IsOptional()
  date?: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsString()
  @IsOptional()
  recurringFrequency?: string;

  @IsBoolean()
  @IsOptional()
  isAmortized?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(2)
  amortizationMonths?: number;
}
