export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
  ASISTENT = 'ASISTENT',
}

export class UserRole {
  private constructor(private readonly value: UserRoleEnum) {}

  static create(value: UserRoleEnum): UserRole {
    return new UserRole(value);
  }

  getValue(): UserRoleEnum {
    return this.value;
  }

  isAdmin(): boolean {
    return this.value === UserRoleEnum.ADMIN;
  }

  isUser(): boolean {
    return this.value === UserRoleEnum.USER;
  }

  isAsistent(): boolean {
    return this.value === UserRoleEnum.ASISTENT;
  }
} 