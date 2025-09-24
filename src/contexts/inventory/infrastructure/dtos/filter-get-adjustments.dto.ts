import { IsNotEmpty, IsNumber, IsOptional, MaxLength, Max, Min, ValidateNested } from "class-validator";
import { IsString } from "class-validator";
import { Type } from "class-transformer";


export class FilterAdjustments {
    dateAsc: boolean;
    dateDesc: boolean;
    thisWeek: boolean;
    thisMonth: boolean;
    thisYear: boolean;
} 

export class FilterGetAdjustmentsDto {
    @IsString({ message: 'Store ID must be a string' })
    @IsNotEmpty({ message: 'Store ID is required' })
    @MaxLength(255, { message: 'Store ID must be less than 255 characters' })
    store_id: string;
    
    @IsNumber()
    @IsNotEmpty({ message: 'Skip is required' })
    @Min(0, { message: 'Skip must be greater than or equal to 0' })
    skip: number;
    
    @IsNumber()
    @IsNotEmpty({ message: 'Take is required' })
    @Min(10, { message: 'Take must be greater than or equal to 0' })
    @Max(100, { message: 'Take must be less than or equal to 100' })
    take: number;
    
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => FilterAdjustments)
    criteria?: FilterAdjustments;
}
