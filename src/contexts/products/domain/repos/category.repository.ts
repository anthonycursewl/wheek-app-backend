import { Category } from "../entities/categories.entity"

export interface CategoryRepository {
    save(category: Category): Promise<Category>
    findAllByStoreId(storeId: string, skip: number, take: number): Promise<Category[]>
}

export const CATEGORY_REPOSITORY = Symbol('CategoryRepository')
