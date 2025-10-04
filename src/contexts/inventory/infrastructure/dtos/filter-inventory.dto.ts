import { IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export const TransformToBoolean = () => {
  return Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  });
};

export class FilterInventoryDto {
  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  lowStock?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  outOfStock?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  hasSales?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  hasReceptions?: boolean;

  @IsOptional()
  @IsDateString()
  lastUpdated_start?: string;

  @IsOptional()
  @IsDateString()
  lastUpdated_end?: string;
}
