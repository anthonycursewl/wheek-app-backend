import { Injectable } from "@nestjs/common";
import { Category } from "../../domain/entities/categories.entity";
import { CategoryRepository } from "../../domain/repos/category.repository";
import { PrismaService } from "@/src/shared/persistance";

@Injectable()
export class CategoryRepositoryAdapter implements CategoryRepository {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async save(category: Category): Promise<Category> {
        const categoryPrimitives = category.toPrimitives()
        const createdCategory = await this.prisma.categories.upsert({
            where: { id: categoryPrimitives.id },
            create: categoryPrimitives,
            update: {
                name: categoryPrimitives.name,
                is_active: categoryPrimitives.is_active,
                updated_at: new Date()
            }
        });

        return Category.fromPrimitives(createdCategory);
    }

    async findAllByStoreId(storeId: string, skip: number, take: number, criteria: any): Promise<Category[]> {
        const categories = await this.prisma.categories.findMany({
            where: {
                store_id: storeId,
                is_active: criteria.where.is_active,
                created_at: criteria.where.created_at,
            },
            skip,
            take,
            orderBy: criteria.orderBy
        });

        return categories.map(category => Category.fromPrimitives(category));
    }

    async findById(id: string): Promise<Category> {
        const category = await this.prisma.categories.findUnique({
            where: { id }
        });

        if (!category || !category.is_active) {
            throw new Error('Category not found or inactive');
        }

        return Category.fromPrimitives(category);
    }

    async update(id: string, data: Category): Promise<Category> {
        const { id: _, name, is_active } = data.toPrimitives();

        const category = await this.prisma.categories.update({
            where: { id },
            data: {
                name,
                is_active,
                updated_at: new Date()
            }
        });

        return Category.fromPrimitives(category);
    }
}