import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Role } from './role.entity';

const SALT_ROUNDS = 10;

export interface UserPrimitive {
  id: string;
  email: string;
  name: string;
  last_name: string;
  username: string;
  password: string;
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date;
  is_active: boolean;
  icon_url?: string;
}

export class User {
  private constructor(
    private readonly id: string,
    private email: string,
    private password: string,
    private name: string,
    private last_name: string,
    private username: string,
    private readonly created_at: Date,
    private updated_at?: Date,
    private deleted_at?: Date,
    private is_active: boolean = true,
    private icon_url?: string,
  ) {}

  static async create(data: Omit<UserPrimitive, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'is_active' | 'icon_url'>): Promise<User> {
    const hashedPassword = await this.hashPassword(data.password);
    return new User(
      uuidv4().split('-')[4],
      data.email,
      hashedPassword,
      data.name,
      data.last_name,
      data.username,
      new Date(),
    );
  }

  static fromPrimitives(data: UserPrimitive): User {
    return new User(
      data.id,
      data.email,
      data.password,
      data.name,
      data.last_name,
      data.username,
      data.created_at,
      data.updated_at,
      data.deleted_at,
      data.is_active,
      data.icon_url,
    );
  }

  toPrimitives(): UserPrimitive {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      name: this.name,
      last_name: this.last_name,
      username: this.username,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at,
      is_active: this.is_active,
      icon_url: this.icon_url,
    };
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  private static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  // Getters
  get idValue(): string {
    return this.id;
  }

  get emailValue(): string {
    return this.email;
  }

  get passwordValue(): string {
    return this.password;
  }

  get nameValue(): string {
    return this.name;
  }

  get lastNameValue(): string {
    return this.last_name;
  }

  get usernameValue(): string {
    return this.username;
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

  get isActiveValue(): boolean {
    return this.is_active;
  }

  get iconUrlValue(): string | undefined {
    return this.icon_url;
  }

  // Setters
  updateEmail(email: string): void {
    this.email = email;
    this.updated_at = new Date();
  }

  updatePassword(password: string): void {
    this.password = password;
    this.updated_at = new Date();
  }

  updateName(name: string): void {
    this.name = name;
    this.updated_at = new Date();
  }

  updateLastName(lastName: string): void {
    this.last_name = lastName;
    this.updated_at = new Date();
  }

  updateUsername(username: string): void {
    this.username = username;
    this.updated_at = new Date();
  }

  updateIconUrl(iconUrl: string): void {
    this.icon_url = iconUrl;
    this.updated_at = new Date();
  }

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
}