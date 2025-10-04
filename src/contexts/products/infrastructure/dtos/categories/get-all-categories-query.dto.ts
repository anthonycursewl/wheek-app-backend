import { IsOptional, IsString } from 'class-validator';
import { FilterCategoryDto } from './filter-category.dto';

export class GetAllCategoriesQueryDto extends FilterCategoryDto {
    @IsOptional()
    @IsString()
    skip?: string;

    @IsOptional()
    @IsString()
    take?: string;
}
