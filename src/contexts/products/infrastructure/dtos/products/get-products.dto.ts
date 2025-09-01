import { IsUUID } from 'class-validator';

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
