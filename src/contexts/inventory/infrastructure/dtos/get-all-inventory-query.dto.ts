import { IsUUID, IsOptional, IsString } from 'class-validator';
import { FilterInventoryDto } from './filter-inventory.dto';

export class GetAllInventoryQueryDto extends FilterInventoryDto {
  @IsUUID(4, { message: 'El store_id debe ser un UUID válido' })
  store_id: string;

  @IsOptional()
  @IsString()
  skip?: string = '0';

  @IsOptional()
  @IsString()
  take?: string = '10';
}
