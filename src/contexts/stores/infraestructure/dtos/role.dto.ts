import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { RolePrimitive } from "@/src/contexts/users/domain/entitys/role.entity";

export type CreateRoleDto = Omit<RolePrimitive, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'is_active' | 'permissions' | 'store' | 'user_roles'> & {
    permissions: string[];
};

export class RoleDto implements CreateRoleDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsString()
    store_id: string;

    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    permissions: string[];
}
    
