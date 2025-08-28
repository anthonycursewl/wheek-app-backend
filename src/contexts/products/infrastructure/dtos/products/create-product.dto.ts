import { 
    IsString, 
    IsNotEmpty, 
    ValidateNested,  
    IsObject, 
    Length, 
    IsAlphanumeric 
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFichaDto } from './create-ficha.dto';

export class CreateProductDto {    
    @IsString({ message: 'El nombre debe ser un texto' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @Length(1, 255, { 
        message: 'El nombre debe tener entre 1 y 255 caracteres' 
    })
    readonly name: string;

    @IsString({ message: 'El código de barras debe ser un texto' })
    @IsNotEmpty({ message: 'El código de barras es requerido' })
    @IsAlphanumeric('en-US', { 
        message: 'El código de barras solo puede contener letras y números' 
    })
    @Length(1, 100, { 
        message: 'El código de barras debe tener entre 1 y 100 caracteres' 
    })
    readonly barcode: string;
    
    @IsNotEmpty({ 
        message: 'El ID de la tienda es requerido' 
    })
    readonly store_id: string;

    @IsNotEmpty({ 
        message: 'El ID del proveedor es requerido' 
    })
    readonly provider_id: string;

    @IsNotEmpty({ 
        message: 'El ID de la categoría es requerido' 
    })
    readonly category_id: string;

    @IsObject({ 
        message: 'La ficha debe ser un objeto' 
    })
    @ValidateNested({ 
        message: 'La ficha no es válida' 
    })
    @Type(() => CreateFichaDto)
    @IsNotEmpty({ message: 'La ficha es requerida' })
    readonly w_ficha: CreateFichaDto;

    constructor(partial: Partial<CreateProductDto>) {
        Object.assign(this, partial);
    }
}