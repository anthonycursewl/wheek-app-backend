import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString, IsDate, isDateString, IsUUID } from "class-validator";

const TransformToBoolean = () => {
  return Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  });
};

export class FilterAllReceptionDto {
  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  today?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  thisWeek?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  thisMonth?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  deleted?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  dateDesc?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  nameAsc?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  nameDesc?: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return undefined;
    
    // Handle URL-encoded ISO date strings
    let decodedValue = value;
    if (typeof value === 'string' && value.includes('%3A')) {
      decodedValue = decodeURIComponent(value);
    }
    
    // Validate if it's a valid date string
    if (!isDateString(decodedValue)) {
      throw new Error(`Invalid date format for dateRange_start: ${value}`);
    }
    
    // Parse the date and return as Date object
    const date = new Date(decodedValue);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date value for dateRange_start: ${value}`);
    }
    
    return date;
  })
  dateRange_start?: Date;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return undefined;
    
    // Handle URL-encoded ISO date strings
    let decodedValue = value;
    if (typeof value === 'string' && value.includes('%3A')) {
      decodedValue = decodeURIComponent(value);
    }
    
    // Validate if it's a valid date string
    if (!isDateString(decodedValue)) {
      throw new Error(`Invalid date format for dateRange_end: ${value}`);
    }
    
    // Parse the date and return as Date object
    const date = new Date(decodedValue);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date value for dateRange_end: ${value}`);
    }
    
    return date;
  })
  dateRange_end?: Date;

  @IsOptional()
  @IsString({ message: 'El ID del proveedor debe ser un string' })
  @IsUUID('all', { message: 'El ID del proveedor debe ser un UUID válido.' })
  provider?: string;
}
