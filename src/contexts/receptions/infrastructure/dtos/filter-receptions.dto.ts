import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString, IsDate, IsUUID } from "class-validator";

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
  @IsDate({ message: 'dateRange_start must be a valid date' })
  @Transform(({ value }) => {
    if (!value) return undefined;
    
    try {
      // Handle URL-encoded ISO date strings
      let decodedValue = value;
      if (typeof value === 'string' && value.includes('%3A')) {
        decodedValue = decodeURIComponent(value);
      }
      
      // Parse the date and return as Date object
      const date = new Date(decodedValue);
      if (isNaN(date.getTime())) {
        return value; // Return original value so class-validator can handle it
      }
      
      return date;
    } catch (error) {
      return value; // Return original value so class-validator can handle it
    }
  })
  dateRange_start?: Date;

  @IsOptional()
  @IsDate({ message: 'dateRange_end must be a valid date' })
  @Transform(({ value }) => {
    if (!value) return undefined;
    
    try {
      // Handle URL-encoded ISO date strings
      let decodedValue = value;
      if (typeof value === 'string' && value.includes('%3A')) {
        decodedValue = decodeURIComponent(value);
      }
      
      // Parse the date and return as Date object
      const date = new Date(decodedValue);
      if (isNaN(date.getTime())) {
        return value; // Return original value so class-validator can handle it
      }
      
      return date;
    } catch (error) {
      return value; // Return original value so class-validator can handle it
    }
  })
  dateRange_end?: Date;

  @IsOptional()
  @IsString({ message: 'El ID del proveedor debe ser un string' })
  @IsUUID('all', { message: 'El ID del proveedor debe ser un UUID válido.' })
  provider?: string;
}
