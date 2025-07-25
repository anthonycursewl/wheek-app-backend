import { 
    IsString, 
    IsNotEmpty, 
    IsNumber, 
    IsBoolean, 
    IsPositive, 
    IsIn, 
    Min, 
    Max, 
    IsOptional 
} from 'class-validator';

export class CreateFichaDto {
    @IsString({ message: 'La condición debe ser un texto' })
    @IsNotEmpty({ message: 'La condición es requerida' })
    @IsIn(['new', 'used', 'refurbished'], { 
        message: 'La condición debe ser uno de los siguientes valores: new, used, refurbished' 
    })
    readonly condition: string;

    @IsNumber({}, { message: 'El costo debe ser un número' })
    @IsPositive({ message: 'El costo debe ser un valor positivo' })
    @Min(0, { message: 'El costo no puede ser negativo' })
    readonly cost: number;

    @IsNumber({}, { message: 'El margen referencial debe ser un número' })
    @IsPositive({ message: 'El margen referencial debe ser un valor positivo' })
    @Min(0, { message: 'El margen referencial no puede ser negativo' })
    @Max(100, { message: 'El margen referencial no puede ser mayor a 100' })
    readonly benchmark: number;

    @IsBoolean({ message: 'El impuesto debe ser un valor booleano (true/false)' })
    readonly tax: boolean;

    constructor(partial: Partial<CreateFichaDto>) {
        Object.assign(this, partial);
    }
}