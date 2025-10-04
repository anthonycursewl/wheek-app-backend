import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class UpdateProviderDTO {

    @IsString({ message: 'El nombre debe ser una cadena de caracteres' })
    @IsOptional()
    @MaxLength(255, { message: 'El nombre debe tener menos de 255 caracteres' })
    name?: string;

    @IsString({ message: 'La descripción debe ser una cadena de caracteres' })
    @IsOptional()
    @MaxLength(255, { message: 'La descripción debe tener menos de 255 caracteres' })
    description?: string;


    @IsString({ message: 'El teléfono debe ser una cadena de caracteres' })
    @IsOptional()
    @MaxLength(255, { message: 'El teléfono debe tener menos de 255 caracteres.' })
    contact_phone?: string;

    @IsString({ message: 'El correo electrónico debe ser una cadena de caracteres' })
    @IsOptional()
    @MaxLength(255, { message: 'El correo electrónico debe tener menos de 255 caracteres.' })
    contact_email?: string;

    @IsBoolean({ message: 'El estado debe ser un booleano' })
    @IsOptional()
    is_active?: boolean;
    
}
