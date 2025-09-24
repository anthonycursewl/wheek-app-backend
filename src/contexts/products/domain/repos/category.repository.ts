import { Category } from "../entities/categories.entity"

export interface CategoryRepository {
    save(category: Category): Promise<Category>
    update(id: string, data: Category): Promise<Category>
    findAllByStoreId(storeId: string, skip: number, take: number, criteria: any): Promise<Category[]>
    findById(id: string): Promise<Category>
}

export const CATEGORY_REPOSITORY = Symbol('CategoryRepository')
