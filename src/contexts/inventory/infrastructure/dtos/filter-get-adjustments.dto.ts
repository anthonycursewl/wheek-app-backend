import { IsNotEmpty, IsNumber, IsOptional, MaxLength, Max, Min, IsBoolean } from "class-validator";
import { IsString } from "class-validator";
import { Type } from "class-transformer";


export class FilterGetAdjustmentsDto {
    @IsString({ message: 'Store ID must be a string' })
    @IsNotEmpty({ message: 'Store ID is required' })
    @MaxLength(255, { message: 'Store ID must be less than 255 characters' })
    store_id: string;
    
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty({ message: 'Skip is required' })
    @Min(0, { message: 'Skip must be greater than or equal to 0' })
    skip: number;
    
    @Type(() => Number)
    @IsNumber()
    @IsNotEmpty({ message: 'Take is required' })
    @Min(10, { message: 'Take must be greater than or equal to 0' })
    @Max(100, { message: 'Take must be less than or equal to 100' })
    take: number;
    
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    today?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    dateAsc?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    dateDesc?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    thisWeek?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    thisMonth?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    thisYear?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    DAMAGED?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    LOST?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    EXPIRED?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    INTERNAL_USE?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    RETURN_TO_SUPPLIER?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    OTHER?: boolean;

    @IsOptional()
    @Type(() => Date)
    adjustmentDateRange_start?: Date;

    @IsOptional()
    @Type(() => Date)
    adjustmentDateRange_end?: Date;
}
