import { UserRole } from "@users/domain/value-objects/user-role.vo";
export interface UserData {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  last_name: string;
  username: string;
  created_at: Date;
  is_active: boolean;
  icon_url: string;
}

export class User {
  private constructor(
    private readonly id: string,
    private readonly email: string,
    private readonly password: string,
    private readonly role: UserRole,
    private readonly name: string,
    private readonly last_name: string,
    private readonly username: string,
    private readonly created_at: Date,
    private readonly is_active: boolean,
    private readonly icon_url: string,
  ) {}

  static create(data: Omit<UserData, 'id' | 'created_at' | 'is_active' | 'icon_url'>): User {
    return new User(
      crypto.randomUUID().split('-')[4],
      data.email,
      data.password,
      data.role,
      data.name,
      data.last_name,
      data.username,
      new Date(),
      true,
      '',
    );
  }

  static fromPrimitives(data: UserData): User {
    return new User(
      data.id,
      data.email,
      data.password,
      data.role,
      data.name,
      data.last_name,
      data.username,
      data.created_at,
      data.is_active,
      data.icon_url,
    );
  }

  toPrimitives(): UserData {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      role: this.role,
      name: this.name,
      last_name: this.last_name,
      username: this.username,
      created_at: this.created_at,
      is_active: this.is_active,
      icon_url: this.icon_url,
    };
  }

  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }

  getRole(): UserRole {
    return this.role;
  }

  getName(): string {
    return this.name;
  }

  getLastName(): string {
    return this.last_name;
  }

  getUsername(): string {
    return this.username;
  }

  getCreatedAt(): Date {
    return this.created_at;
  }

  getIsActive(): boolean {
    return this.is_active;
  }

  getIconUrl(): string {
    return this.icon_url;
  }
} 

/*
User example

{
  "email": "zerpaanthony.wx@breadriuss.com",
  "password": "perritoconollo12",
  "role": "USER",
  "name": "Anthony",
  "last_name": "Cursewl",
  "username": "anthonycursewl",
}

*/