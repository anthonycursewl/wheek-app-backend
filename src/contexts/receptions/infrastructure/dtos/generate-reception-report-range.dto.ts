import { IsDateString, IsNotEmpty, IsUUID, MaxLength } from "class-validator";

export class GenerateReceptionReportRangeDto {
    @IsNotEmpty({ message: 'El ID de la tienda es requerido.' })
    @IsUUID('4', { message: 'El ID de la tienda debe ser un UUID válido.' })
    store_id: string;

    @IsNotEmpty({ message: 'La fecha de inicio es requerida.' })
    @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida.' })
    startDate_range: string;

    @IsNotEmpty({ message: 'La fecha de fin es requerida.' })
    @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida.' })
    endDate_range: string;
}
