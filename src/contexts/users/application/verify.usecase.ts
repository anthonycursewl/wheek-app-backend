
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { failure, Result, success } from "@shared/ROP/result";

@Injectable()
export class VerifyUseCase {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async execute(token: string, secret: string): Promise<Result<string, Error>> {
    try {
      const decoded = this.jwtService.verify(token, { secret: secret });
      if (!decoded) {
        return failure(new Error('Invalid token'));
      }

      return success(decoded.sub);
    } catch (error) {
      return failure(error);
    }
  }
}