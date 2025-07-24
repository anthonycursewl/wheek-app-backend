import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";

export class CreateProviderDto {
    @IsString({ message: 'name must be a string' })
    @IsNotEmpty({ message: 'name is required' })
    name: string;

    @IsString({ message: 'description must be a string' })
    @IsOptional()
    description?: string | null;

    @IsString({ message: 'store_id must be a string' })
    @IsNotEmpty({ message: 'store_id is required' })
    store_id: string;

    @IsString({ message: 'contact_phone must be a string' })
    @IsOptional()
    contact_phone: string;

    @IsString({ message: 'contact_email must be a string' })
    @IsOptional()
    contact_email: string;

    @IsBoolean({ message: 'is_active must be a boolean' })
    @IsOptional()
    is_active: boolean;
}
