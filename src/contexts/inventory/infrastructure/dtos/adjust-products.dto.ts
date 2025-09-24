import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export enum AdjustmentReason {
  DAMAGED = 'DAMAGED',
  LOST = 'LOST',
  EXPIRED = 'EXPIRED',
  INTERNAL_USE = 'INTERNAL_USE',
  RETURN_TO_SUPPLIER = 'RETURN_TO_SUPPLIER',
  OTHER = 'OTHER'
}

export class AdjustmentItemDto {
  @IsNotEmpty({ message: 'product_id is required' })
  @IsUUID('all', { message: 'product_id must be a valid UUID' })
  product_id: string;

  @IsNotEmpty({ message: 'quantity is required' })
  @IsNumber({}, { message: 'quantity must be a number' })
  quantity: number;
}

export class AdjustProductsDto {
  @IsNotEmpty({ message: 'store_id is required' })
  @IsUUID('all', { message: 'store_id must be a valid UUID' })
  store_id: string;

  @IsNotEmpty({ message: 'user_id is required' })
  @IsString({ message: 'user_id must be a string' })
  user_id: string;

  @IsOptional()
  adjustment_date: Date;

  @IsNotEmpty({ message: 'reason is required' })
  @IsEnum(AdjustmentReason, { message: 'reason must be a valid adjustment reason' })
  reason: AdjustmentReason;

  @IsOptional()
  @IsString({ message: 'notes must be a string' })
  notes: string;

  @IsNotEmpty({ message: 'items are required' })
  @IsArray({ message: 'items must be an array' })
  @ValidateNested({ each: true })
  @Type(() => AdjustmentItemDto)
  items: AdjustmentItemDto[];
}
