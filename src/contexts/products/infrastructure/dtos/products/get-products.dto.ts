import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetProductsDto {
    @IsUUID(4, { message: 'El id debe ser un UUID válido' })
    store_id: string;

    skip: string;
    take: string;
}

export class ProductResponseDto {
    id: string;
    barcode: string;
    name: string;
    store_id: string;
    created_at: Date;
}

const TransformToBoolean = () => {
  return Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  });
};

export class ProductFilterDto {
  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  today?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  thisWeek?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  thisMonth?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  deleted?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  dateDesc?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  KG?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  UND?: boolean;
}
