import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/src/common/guards/jwt-auth.guard';

import { Partner } from '../../domain/entities/partner.entity';
import { PARTNER_REPOSITORY, PartnerRepository } from '../../domain/repos/partner.repository';
import { Inject } from '@nestjs/common';
import { IsString, IsOptional, IsArray, IsBoolean, IsNumber, IsUrl, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// DTOs
class CreatePartnerDto {
    @IsString()
    @MinLength(3)
    @ApiProperty({ description: 'Partner name' })
    name: string;

    @IsArray()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Allowed IP addresses', type: [String] })
    allowed_ips?: string[];

    @IsArray()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Partner permissions', type: [String] })
    permissions?: string[];

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Rate limit (requests per minute)' })
    rate_limit?: number;

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Can link users with consent flow' })
    can_link_users?: boolean;

    @IsUrl()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Partner logo URL' })
    logo_url?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Partner description' })
    description?: string;

    @IsArray()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Allowed redirect URIs', type: [String] })
    allowed_redirect_uris?: string[];

    @IsArray()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Default OAuth scopes', type: [String] })
    default_scopes?: string[];

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ description: 'OAuth Client ID for linking' })
    client_id?: string;
}

class UpdatePartnerDto {
    @IsArray()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Allowed IP addresses', type: [String] })
    allowed_ips?: string[];

    @IsArray()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Partner permissions', type: [String] })
    permissions?: string[];

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Rate limit (requests per minute)' })
    rate_limit?: number;

    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Active status' })
    is_active?: boolean;
}

@ApiTags('admin/partners')
@Controller('admin/partners')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminPartnerController {
    constructor(
        @Inject(PARTNER_REPOSITORY)
        private readonly partnerRepository: PartnerRepository,
    ) { }

    /**
     * Create a new partner
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new partner (Admin only)' })
    @ApiResponse({ status: 201, description: 'Partner created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async createPartner(@Body() dto: CreatePartnerDto) {
        // Check if partner with same name already exists
        const existing = await this.partnerRepository.findByName(dto.name);
        if (existing) {
            throw new BadRequestException({
                error: 'partner_already_exists',
                message: `Ya existe un partner con el nombre "${dto.name}"`,
            });
        }

        const partner = Partner.create({
            name: dto.name,
            allowed_ips: dto.allowed_ips,
            permissions: dto.permissions,
            rate_limit: dto.rate_limit,
            can_link_users: dto.can_link_users,
            logo_url: dto.logo_url,
            description: dto.description,
            allowed_redirect_uris: dto.allowed_redirect_uris,
            default_scopes: dto.default_scopes,
            client_id: dto.client_id,
        });

        const created = await this.partnerRepository.create(partner);
        const primitives = created.toPrimitives();

        return {
            id: primitives.id,
            name: primitives.name,
            api_key: primitives.api_key,
            allowed_ips: primitives.allowed_ips,
            permissions: primitives.permissions,
            rate_limit: primitives.rate_limit,
            is_active: primitives.is_active,
            can_link_users: primitives.can_link_users,
            logo_url: primitives.logo_url,
            description: primitives.description,
            allowed_redirect_uris: primitives.allowed_redirect_uris,
            default_scopes: primitives.default_scopes,
            client_id: primitives.client_id,
            created_at: primitives.created_at,
        };
    }

    /**
     * Get all partners
     */
    @Get()
    @ApiOperation({ summary: 'Get all partners (Admin only)' })
    @ApiResponse({ status: 200, description: 'List of partners' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getPartners() {
        const partners = await this.partnerRepository.findAll();

        return partners.map(p => {
            const primitives = p.toPrimitives();
            return {
                id: primitives.id,
                name: primitives.name,
                api_key: primitives.api_key,
                allowed_ips: primitives.allowed_ips,
                permissions: primitives.permissions,
                rate_limit: primitives.rate_limit,
                is_active: primitives.is_active,
                can_link_users: primitives.can_link_users,
                logo_url: primitives.logo_url,
                description: primitives.description,
                client_id: primitives.client_id,
                created_at: primitives.created_at,
            };
        });
    }

    /**
     * Get a partner by ID
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get a partner by ID (Admin only)' })
    @ApiResponse({ status: 200, description: 'Partner details' })
    @ApiResponse({ status: 404, description: 'Partner not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getPartner(@Param('id') id: string) {
        try {
            const partner = await this.partnerRepository.findById(id);

            if (!partner) {
                throw new NotFoundException({
                    error: 'partner_not_found',
                    message: 'El partner solicitado no existe o fue eliminado',
                });
            }

            const primitives = partner.toPrimitives();
            return {
                id: primitives.id,
                name: primitives.name,
                api_key: primitives.api_key,
                allowed_ips: primitives.allowed_ips,
                permissions: primitives.permissions,
                rate_limit: primitives.rate_limit,
                is_active: primitives.is_active,
                can_link_users: primitives.can_link_users,
                logo_url: primitives.logo_url,
                description: primitives.description,
                allowed_redirect_uris: primitives.allowed_redirect_uris,
                default_scopes: primitives.default_scopes,
                client_id: primitives.client_id,
                created_at: primitives.created_at,
            };
        } catch (error) {
            // Handle Prisma invalid UUID error
            if (error.code === 'P2007' || error.message?.includes('invalid input syntax for type uuid')) {
                throw new BadRequestException({
                    error: 'invalid_partner_id',
                    message: 'El ID del partner no es válido. Debe ser un UUID válido.',
                });
            }
            throw error;
        }
    }

    /**
     * Update a partner
     */
    @Patch(':id')
    @ApiOperation({ summary: 'Update a partner (Admin only)' })
    @ApiResponse({ status: 200, description: 'Partner updated' })
    @ApiResponse({ status: 404, description: 'Partner not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updatePartner(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
        try {
            const partner = await this.partnerRepository.findById(id);

            if (!partner) {
                throw new NotFoundException({
                    error: 'partner_not_found',
                    message: 'El partner que intentas actualizar no existe',
                });
            }

            if (dto.allowed_ips !== undefined) {
                partner.updateAllowedIps(dto.allowed_ips);
            }

            if (dto.permissions !== undefined) {
                partner.updatePermissions(dto.permissions);
            }

            if (dto.rate_limit !== undefined) {
                partner.updateRateLimit(dto.rate_limit);
            }

            if (dto.is_active !== undefined) {
                if (dto.is_active) {
                    partner.activate();
                } else {
                    partner.deactivate();
                }
            }

            const updated = await this.partnerRepository.update(partner);
            const primitives = updated.toPrimitives();

            return {
                id: primitives.id,
                name: primitives.name,
                is_active: primitives.is_active,
                updated_at: primitives.updated_at,
            };
        } catch (error) {
            // Handle Prisma invalid UUID error
            if (error.code === 'P2007' || error.message?.includes('invalid input syntax for type uuid')) {
                throw new BadRequestException({
                    error: 'invalid_partner_id',
                    message: 'El ID del partner no es válido. Debe ser un UUID válido.',
                });
            }
            throw error;
        }
    }

    /**
     * Delete a partner
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a partner (Admin only)' })
    @ApiResponse({ status: 204, description: 'Partner deleted' })
    @ApiResponse({ status: 404, description: 'Partner not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async deletePartner(@Param('id') id: string) {
        try {
            const partner = await this.partnerRepository.findById(id);

            if (!partner) {
                throw new NotFoundException({
                    error: 'partner_not_found',
                    message: 'El partner que intentas eliminar no existe',
                });
            }

            await this.partnerRepository.delete(id);
        } catch (error) {
            // Handle Prisma invalid UUID error
            if (error.code === 'P2007' || error.message?.includes('invalid input syntax for type uuid')) {
                throw new BadRequestException({
                    error: 'invalid_partner_id',
                    message: 'El ID del partner no es válido. Debe ser un UUID válido.',
                });
            }
            throw error;
        }
    }
}
