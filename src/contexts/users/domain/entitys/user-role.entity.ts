import crypto from 'crypto';
import { Store } from '@/src/contexts/stores/domain/entities/store.entity';
import { User } from './user.entity';
import { Role, RolePrimitive } from './role.entity';

export interface UserRolePrimitive {
  id: string;
  user_id: string;
  role_id: string;
  store_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
  user?: User;
  role?: RolePrimitive;
  store?: Store;
}

export class UserRole {
   private constructor(
        private readonly id: string,
        private readonly user_id: string,
        private role_id: string,
        private store_id: string,
        private is_active: boolean,
        private readonly created_at: Date,
        private updated_at?: Date,
        private deleted_at?: Date,

        // Relaciones
        private user?: User,
        private role?: Role,
        private store?: Store,
    ) {}

  static create(data: Omit<UserRolePrimitive, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'user' | 'role' | 'store'>): UserRole {
    return new UserRole(
      crypto.randomUUID(),
      data.user_id,
      data.role_id,
      data.store_id,
      data.is_active ?? true,
      new Date(),
      undefined,
      undefined
    );
  }

  static fromPrimitives(data: UserRolePrimitive): UserRole {
    return new UserRole(
      data.id,
      data.user_id,
      data.role_id,
      data.store_id,
      data.is_active,
      data.created_at,
      data.updated_at,
      data.deleted_at,

      // Relaciones
      data.user,
      data.role ? Role.fromPrimitive(data.role) : undefined,
      data.store
    );
  }

  // Getters
  get idValue(): string {
    return this.id;
  }

  get userIdValue(): string {
    return this.user_id;
  }

  get roleIdValue(): string {
    return this.role_id;
  }

  get storeIdValue(): string {
    return this.store_id;
  }

  get isActiveValue(): boolean {
    return this.is_active;
  }

  get createdAtValue(): Date {
    return this.created_at;
  }

  get updatedAtValue(): Date | undefined {
    return this.updated_at;
  }

  get deletedAtValue(): Date | undefined {
    return this.deleted_at;
  }

  getUserValue(): User | undefined {
    return this.user;
  }

  getRoleValue(): Role | undefined {
    return this.role;
  }

  getStoreValue(): Store | undefined {
    return this.store;
  }

  // Setters
  deactivate(): void {
    this.is_active = false;
    this.deleted_at = new Date();
    this.updated_at = new Date();
  }

  activate(): void {
    this.is_active = true;
    this.deleted_at = undefined;
    this.updated_at = new Date();
  }

  updateRole(roleId: string): void {
    this.role_id = roleId;
    this.updated_at = new Date();
  }

  updateStore(storeId: string): void {
    this.store_id = storeId;
    this.updated_at = new Date();
  }

  toPrimitives(): UserRolePrimitive {
    return {
      id: this.id,
      user_id: this.user_id,
      role_id: this.role_id,
      store_id: this.store_id,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at,
      user: this.user,
      role: this.role?.toPrimitive(),
      store: this.store
    };
  }
}
