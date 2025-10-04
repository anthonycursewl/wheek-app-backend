import { IsOptional, IsString, IsUUID } from 'class-validator';
import { FilterAllProviderDto } from './filter-all-provider.dto';

export class GetAllProvidersQueryDto extends FilterAllProviderDto {
    @IsUUID(4, { message: 'El id de la tienda debe ser un UUID válido' })
    store_id: string;

    @IsOptional()
    @IsString()
    skip?: string;

    @IsOptional()
    @IsString()
    take?: string;
}
