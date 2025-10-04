import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

const TransformToBoolean = () => {
  return Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  });
};

export class FilterAllProviderDto {
  @IsOptional()
  @TransformToBoolean()
  today?: boolean;

  @IsOptional()
  @TransformToBoolean()
  thisWeek?: boolean;

  @IsOptional()
  @TransformToBoolean()
  thisMonth?: boolean;

  @IsOptional()
  @TransformToBoolean()
  deleted?: boolean;

  @IsOptional()
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
}
