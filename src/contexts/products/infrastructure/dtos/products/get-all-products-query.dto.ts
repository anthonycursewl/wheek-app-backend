import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ProductFilterDto } from './get-products.dto';

const TransformToBoolean = () => {
  return Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  });
};

export class GetAllProductsQueryDto extends ProductFilterDto {
    @IsUUID(4, { message: 'El id de la tienda debe ser un UUID válido' })
    store_id: string;

    @IsOptional()
    @IsString()
    skip?: string;

    @IsOptional()
    @IsString()
    take?: string;
}
