import { IsUUID } from 'class-validator';

export class ProviderQueryDto {
    @IsUUID(4, { message: 'El id de la tienda debe ser un UUID válido' })
    store_id: string;
}
