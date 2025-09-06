import { Store } from "../entities/store.entity";
import { Transaction } from "@/src/contexts/shared/persistance/transactions";

export interface StoreRepository {
    create(store: Store, tx?: Transaction): Promise<Store>;
    findById(id: string, tx?: Transaction): Promise<Store | null>;
    update(store: Store, tx?: Transaction): Promise<Store>;
    findAllById(id: string, tx?: Transaction): Promise<Store[]>;
}

export const STORE_REPOSITORY = Symbol('StoreRepository');