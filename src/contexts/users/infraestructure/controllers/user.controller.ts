import { Controller, Get, Req, UnauthorizedException } from "@nestjs/common";
import { VerifyUseCase } from "@users/application/verify.usecase";
import { UserUseCase } from "../../application/user.usecase";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { FastifyRequest as Request } from "fastify";

@Controller('user')
@ApiTags('user')
export class UserController {
    constructor(
        private readonly verifyUseCase: VerifyUseCase,
        private readonly userUseCase: UserUseCase,
    ) {}

    @Get('verify')
    @ApiOperation({ summary: 'Verify user' })
    @ApiResponse({ status: 200, description: 'User verified successfully' })
    @ApiResponse({ status: 401, description: 'Invalid token. Please login again' })
    async verify(@Req() req: Request) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Token is required');
        }

        const decoded = await this.verifyUseCase.execute(token, process.env.JWT_SECRET || '');
        if (!decoded.isSuccess) {
            throw new UnauthorizedException(decoded.error.message);
        }
        
        return this.userUseCase.execute(decoded.value);
    }
}