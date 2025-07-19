import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty({ message: 'name is required' })
    @IsString({ message: 'name must be a string' })
    name: string;

    @IsNotEmpty({ message: 'store_id is required' })
    @IsUUID('all', { message: 'store_id must be a valid UUID' })
    store_id: string;
}
