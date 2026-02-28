import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { PartnerRepository, PARTNER_REPOSITORY } from '../../domain/repos/partner.repository';

@Injectable()
export class PartnerApiKeyGuard implements CanActivate {
    constructor(
        @Inject(PARTNER_REPOSITORY)
        private readonly partnerRepository: PartnerRepository,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Get API key from header
        const apiKey = request.headers['x-partner-api-key'];

        if (!apiKey) {
            throw new UnauthorizedException({
                error: 'unauthorized',
                message: 'Missing X-Partner-API-Key header',
            });
        }

        // Find partner by API key
        const partner = await this.partnerRepository.findByApiKey(apiKey);

        if (!partner) {
            throw new UnauthorizedException({
                error: 'unauthorized',
                message: 'Invalid API key',
            });
        }

        if (!partner.isActiveValue) {
            throw new UnauthorizedException({
                error: 'unauthorized',
                message: 'API key has been revoked',
            });
        }

        // Validate IP if configured
        const clientIp = this.getClientIp(request);
        if (!partner.validateIp(clientIp)) {
            throw new UnauthorizedException({
                error: 'unauthorized',
                message: 'IP not allowed',
            });
        }

        // Attach partner to request for later use
        request.partner = partner;

        return true;
    }

    private getClientIp(request: any): string {
        // Try various headers that might contain the real IP
        const forwardedFor = request.headers['x-forwarded-for'];
        if (forwardedFor) {
            // Handle comma-separated list
            return forwardedFor.split(',')[0].trim();
        }

        return request.headers['x-real-ip'] ||
            request.ip ||
            request.connection?.remoteAddress ||
            'unknown';
    }
}
