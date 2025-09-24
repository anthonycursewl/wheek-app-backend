import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

const TransformToBoolean = () => {
  return Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  });
};

export class FilterCategoryDto {
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
  nameDesc?: boolean;

  @IsOptional()
  @IsBoolean()
  @TransformToBoolean()
  nameAsc?: boolean;
}
