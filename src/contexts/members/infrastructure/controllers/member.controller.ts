import { Controller, Get, Post, Query, Param, HttpCode, HttpStatus, ValidationPipe, Body } from '@nestjs/common';
import { GetAllMembersUseCase } from '../../application/get-all-members.usecase';
import { InviteMemberUseCase } from '../../application/invite-member.usecase';
import { GetAllMembersCriteria } from '../../domain/entities/member.types';
import { Member } from '../../domain/entities/Member';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FilterMembersDto } from '../dto/filter-members.dto';
import { InviteMemberDto } from '../dto/invite-member.dto';
import { InvitationResponseDto } from '../dto/invitation-response.dto';
import { Result } from '@/src/contexts/shared/ROP/result';
import { Invitation } from '../../domain/entities/Invitation';
import { CurrentUser } from '@/src/common/decorators/current-user.decorator';
import { JwtPayload } from '@/src/common/interfaces/jwt-payload.interface';

@ApiTags('members')
@Controller('members/:store_id/get/all')
export class MemberController {
  constructor(
    private readonly getAllMembersUseCase: GetAllMembersUseCase,
    private readonly inviteMemberUseCase: InviteMemberUseCase
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Invite a new member to a store' })
  @ApiResponse({ 
    status: 201, 
    description: 'Invitation created successfully',
    type: InvitationResponseDto
  })
  @ApiParam({ name: 'store_id', description: 'Store UUID' })
  async inviteMember(
    @Param('store_id') store_id: string,
    @Body() inviteDto: InviteMemberDto,
    @CurrentUser() user: JwtPayload
  ): Promise<Result<Invitation, Error>> {
    const invited_by_id = user.sub;
    return this.inviteMemberUseCase.execute(store_id, invited_by_id, inviteDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all members of a store with pagination and filtering' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of members',
    type: [Member]
  })
  @ApiParam({ name: 'store_id', description: 'Store UUID' })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of items to skip (default: 0)' })
  @ApiQuery({ name: 'take', required: false, description: 'Number of items to take (default: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, email, username or role' })
  @ApiQuery({ name: 'role_id', required: false, description: 'Filter by role UUID' })
  @ApiQuery({ name: 'is_active', required: false, description: 'Filter by active status (true/false)' })
  @ApiQuery({ name: 'include_permissions', required: false, description: 'Include role permissions (true/false)' })
  async getAllMembers(
    @Param('store_id') store_id: string,
    @Query(new ValidationPipe({ transform: true })) filterDto: FilterMembersDto,
  ): Promise<Result<Member[], Error>> {
    const criteria: GetAllMembersCriteria = {
      search: filterDto.search,
      role_id: filterDto.role_id,
      is_active: filterDto.is_active,
      include_permissions: filterDto.include_permissions,
    };

    const skip = filterDto.skip !== undefined ? Number(filterDto.skip) : 0;
    const take = filterDto.take !== undefined ? Number(filterDto.take) : 10;
    
    return this.getAllMembersUseCase.execute(
      store_id,
      skip,
      take,
      criteria
    );
  }


  @Get('active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get active members of a store' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of active members',
    type: [Member]
  })
  @ApiParam({ name: 'store_id', description: 'Store UUID' })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of items to skip (default: 0)' })
  @ApiQuery({ name: 'take', required: false, description: 'Number of items to take (default: 10)' })
  @ApiQuery({ name: 'include_permissions', required: false, description: 'Include role permissions (true/false)' })
  async getActiveMembers(
    @Param('store_id') store_id: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('include_permissions') include_permissions?: string
  ): Promise<Result<Member[], Error>> {
    const skipNum = skip !== undefined ? Number(skip) : 0;
    const takeNum = take !== undefined ? Number(take) : 10;
    const includePerms = include_permissions?.toLowerCase() === 'true';
    
    const criteria: GetAllMembersCriteria = {
      is_active: true,
      include_permissions: includePerms,
    };

    return this.getAllMembersUseCase.execute(
      store_id,
      skipNum,
      takeNum,
      criteria
    );
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search members by name, email or username' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of members matching search criteria',
    type: [Member]
  })
  @ApiParam({ name: 'store_id', description: 'Store UUID' })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum results (default: 10)' })
  async searchMembers(
    @Param('store_id') store_id: string,
    @Query('q') searchTerm: string,
    @Query('limit') limit?: string
  ): Promise<Result<Member[], Error>> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const criteria: GetAllMembersCriteria = {
      search: searchTerm,
    };

    return this.getAllMembersUseCase.execute(
      store_id,
      0,
      limitNum,
      criteria
    );
  }

  @Get('roles/:role_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get members by specific role' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of members with the specified role',
    type: [Member]
  })
  @ApiParam({ name: 'store_id', description: 'Store UUID' })
  @ApiParam({ name: 'role_id', description: 'Role UUID' })
  @ApiQuery({ name: 'include_permissions', required: false, description: 'Include role permissions (true/false)' })
  async getMembersByRole(
    @Param('store_id') store_id: string,
    @Param('role_id') role_id: string,
    @Query('include_permissions') include_permissions?: string
  ): Promise<Result<Member[], Error>> {
    const includePerms = include_permissions?.toLowerCase() === 'true';
    const criteria: GetAllMembersCriteria = {
      role_id,
      include_permissions: includePerms,
    };

    return this.getAllMembersUseCase.execute(
      store_id,
      0,
      Number.MAX_SAFE_INTEGER,
      criteria
    );
  }
}