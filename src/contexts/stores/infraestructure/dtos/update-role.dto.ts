import { IsArray, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, IsUUID, IsBoolean } from "class-validator";

export class UpdateRoleDto {
    @IsOptional()
    @IsString({ message: 'Wheek | El nombre debe ser una cadena de texto.' })
    @MinLength(3, { message: 'Wheek | El nombre debe tener al menos 3 caracteres.' })
    @MaxLength(50, { message: 'Wheek | El nombre debe tener al menos 50 caracteres.' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'Wheek | La descripción debe ser una cadena de texto.' })
    description?: string;

    @IsOptional()
    @IsUUID('all', { message: 'Wheek | El ID de la tienda debe ser un UUID válido.' })
    store_id?: string;

    @IsOptional()
    @IsBoolean({ message: 'Wheek | El estado debe ser un booleano.' })
    is_active?: boolean;

    @IsOptional()
    @IsArray({ message: 'Wheek | Los permisos deben ser un array.' })
    @IsString({ each: true, message: 'Wheek | Los permisos deben ser cadenas de texto.' })
    @MaxLength(100, { each: true, message: 'Wheek | Cada permiso debe tener como máximo 100 caracteres.' })
    @MinLength(1, { each: true, message: 'Wheek | Cada permiso debe tener al menos 1 caracter.' })
    permissions?: string[];
}
