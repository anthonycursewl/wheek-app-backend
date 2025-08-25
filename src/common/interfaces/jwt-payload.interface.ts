export interface JwtPayload {
  sub: string;
  email: string;
  permissions: { action: string, resource: string }[];
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
