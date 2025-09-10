import { IsArray, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, IsUUID, IsBoolean } from "class-validator";
import { RolePrimitive } from "@/src/contexts/users/domain/entitys/role.entity";

export type CreateRoleDto = Omit<RolePrimitive, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'is_active' | 'permissions' | 'store' | 'user_roles'> & {
    permissions: string[];
};

export class RoleDto implements CreateRoleDto {
    @IsNotEmpty({ message: 'Wheek | El nombre es requerido.' })
    @IsString({ message: 'Wheek | El nombre debe ser una cadena de texto.' })
    @MinLength(3, { message: 'Wheek | El nombre debe tener al menos 3 caracteres.' })
    @MaxLength(50, { message: 'Wheek | El nombre debe tener al menos 50 caracteres.' })
    name: string;

    @IsOptional()
    @IsString({ message: 'Wheek | La descripción debe ser una cadena de texto.' })
    description?: string;

    @IsNotEmpty({ message: 'Wheek | El ID de la tienda es requerido.' })
    @IsUUID('all', { message: 'Wheek | El ID de la tienda debe ser un UUID válido.' })
    store_id: string;

    @IsNotEmpty({ message: 'Wheek | El estado es requerido.' })
    @IsBoolean({ message: 'Wheek | El estado debe ser un booleano.' })
    is_active: boolean

    @IsNotEmpty({ message: 'Wheek | Los permisos son requeridos.' })
    @IsArray({ message: 'Wheek | Los permisos deben ser un array.' })
    @IsString({ each: true, message: 'Wheek | Los permisos deben ser cadenas de texto.' })
    @MaxLength(20, { message: 'Wheek | Los permisos deben tener al menos 50 caracteres.' })
    @MinLength(1, { message: 'Wheek | Los permisos deben tener al menos 1 permiso.' })
    permissions: string[];
}
    
