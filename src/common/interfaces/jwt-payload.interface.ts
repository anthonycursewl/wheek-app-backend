import { Role } from '../enums/roles.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  // Add any additional user properties you want to include in the JWT token
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
