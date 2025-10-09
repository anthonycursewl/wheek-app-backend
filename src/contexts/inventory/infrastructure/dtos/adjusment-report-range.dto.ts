import { IsISO8601, IsNotEmpty, IsUUID, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { IsAfterStartDate } from '@/src/common/validators/is-after-start-date.validator';

export class AdjustmentReportRangeDto {
  @IsUUID('4', { message: 'El ID de la tienda debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID de la tienda es requerido' })
  store_id: string;

  @IsISO8601({ strict: true }, { message: 'La fecha de inicio debe ser una fecha válida en formato ISO 8601' })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  startDate_range: string;

  @IsISO8601({ strict: true }, { message: 'La fecha de fin debe ser una fecha válida en formato ISO 8601' })
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  @Validate(IsAfterStartDate, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio'
  })
  endDate_range: string;
}
