import { 
    IsArray, 
    IsNotEmpty, 
    IsNumber, 
    IsString, 
    MaxLength,
    ValidateNested 
} from "class-validator";
import { Type } from "class-transformer";

export class CreateReceptionItemDto {
    @IsString({ message: 'El ID del producto es requerido. Intenta de nuevo.' })
    @IsNotEmpty({ message: 'El ID del producto es requerido. Intenta de nuevo.' })
    @MaxLength(255, { message: 'El ID del producto es demasiado largo. Intenta de nuevo.' })
    product_id: string;

    @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 }, { message: 'La cantidad debe ser un número entero.'})
    @IsNotEmpty({ message: 'La cantidad es requerida. Intenta de nuevo.' })
    quantity: number;   

    @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 }, { message: 'El precio de costo debe ser un número.'})
    @IsNotEmpty({ message: 'El precio de costo es requerido. Intenta de nuevo.' })
    cost_price: number;
}

export class CreateReceptionDto {
    @IsString({ message: 'El ID de la tienda es requerido. Intenta de nuevo.' })
    @IsNotEmpty({ message: 'El ID de la tienda es requerido. Intenta de nuevo.' })
    @MaxLength(255, { message: 'El ID de la tienda es demasiado largo. Intenta de nuevo.' })
    store_id: string;
    
    @IsString({ message: 'El ID del usuario es requerido. Intenta de nuevo.' })
    @IsNotEmpty({ message: 'El ID del usuario es requerido. Intenta de nuevo.' })
    @MaxLength(255, { message: 'El ID del usuario es demasiado largo. Intenta de nuevo.' })
    user_id: string;

    @IsString({ message: 'El ID del proveedor debe ser una cadena de texto.' })
    @MaxLength(255, { message: 'El ID del proveedor es demasiado largo. Intenta de nuevo.' })
    provider_id: string | null;

    @IsString({ message: 'Las notas deben ser una cadena de texto.' })
    @MaxLength(255, { message: 'Las notas son demasiado largas. Intenta de nuevo.' })
    notes: string | null;

    @IsArray({ message: 'Los items deben ser un array. Intenta de nuevo.' })
    @IsNotEmpty({ message: 'Los items no pueden estar vacíos. Intenta de nuevo.' })
    @ValidateNested({ each: true })
    @Type(() => CreateReceptionItemDto)
    items: CreateReceptionItemDto[];

}
