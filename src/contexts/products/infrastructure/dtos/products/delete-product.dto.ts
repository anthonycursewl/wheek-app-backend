import { IsNotEmpty, IsString } from "class-validator";
import { Type } from "class-transformer";

export class DeleteProductDto {
    @Type(() => String)
    @IsString()
    @IsNotEmpty({ message: 'El ID del producto es requerido para la eliminación.' })
    readonly id: string;
}
    