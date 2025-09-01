import {
    IsString,
    IsNotEmpty,
    IsUUID,
    ValidateNested,
    IsObject,
    Length,
    IsAlphanumeric,
    IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateFichaDto } from './create-ficha.dto';

export class UpdateProductDto {
    @IsNotEmpty({ message: 'El ID es requerido'})
    @IsString({ message: 'El ID debe ser un texto' })
    readonly id: string;

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

    @IsUUID(4, {
        message: 'El ID de la tienda debe ser un UUID v4 válido'
    })
    @IsNotEmpty({
        message: 'El ID de la tienda es requerido'
    })
    readonly store_id: string;

    @IsUUID(4, {
        message: 'El ID del proveedor debe ser un UUID v4 válido'
    })
    @IsNotEmpty({
        message: 'El ID del proveedor es requerido'
    })
    readonly provider_id: string;

    @IsUUID(4, {
        message: 'El ID de la categoría debe ser un UUID v4 válido'
    })
    @IsNotEmpty({
        message: 'El ID de la categoría es requerido'
    })
    readonly category_id: string;

    @IsDate({
        message: 'La fecha de creación debe ser una fecha'
    })
    @IsNotEmpty({
        message: 'La fecha de creación es requerida'
    })
    readonly created_at: Date;

    @IsObject({
        message: 'La ficha debe ser un objeto'
    })
    @ValidateNested({
        message: 'La ficha no es válida'
    })
    @Type(() => UpdateFichaDto)
    @IsNotEmpty({ message: 'La ficha es requerida' })
    readonly w_ficha: UpdateFichaDto;

    constructor(partial: Partial<UpdateProductDto>) {
        Object.assign(this, partial);
    }
}