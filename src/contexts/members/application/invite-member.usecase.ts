import { Injectable, Inject } from "@nestjs/common";
import { MemberRepository } from "../domain/repos/member.repository";
import { InviteMemberDto } from "../infrastructure/dto/invite-member.dto";
import { Invitation } from "../domain/entities/Invitation";
import { Result, success, failure } from "../../shared/ROP/result";
import { MEMBER_REPOSITORY } from "../domain/repos/member.repository";
import { IEmailService, EMAIL_SERVICE } from "../../shared/infrastructure/email/interfaces/email.service.interface";
import { StoreRepository } from "../../stores/domain/repos/store.repository";
import { UserRepository } from "../../users/domain/repos/user.repository";
import { RoleRepository } from "../../stores/domain/repos/role.repository";
import { STORE_REPOSITORY } from "../../stores/domain/repos/store.repository";
import { USER_REPOSITORY } from "../../users/domain/repos/user.repository";
import { ROLE_REPOSITORY } from "../../stores/domain/repos/role.repository";
import { randomUUID } from 'crypto';
import { addDays } from 'date-fns';

@Injectable()
export class InviteMemberUseCase {
    constructor(
        @Inject(MEMBER_REPOSITORY)
        private readonly memberRepository: MemberRepository,
        @Inject(EMAIL_SERVICE)
        private readonly emailService: IEmailService,
        @Inject(STORE_REPOSITORY)
        private readonly storeRepository: StoreRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: RoleRepository
    ) {}

    async execute(store_id: string, invited_by_id: string, inviteDto: InviteMemberDto): Promise<Result<Invitation, Error>> {
        try {
            if (!store_id) {
                throw new Error('Store ID is required');
            }

            if (!invited_by_id) {
                throw new Error('Invited by user ID is required');
            }

            if (!inviteDto.email) {
                throw new Error('Email is required');
            }

            if (!inviteDto.role_id) {
                throw new Error('Role ID is required');
            }


            const existingInvitation = await this.memberRepository.findByEmailAndStore(
                inviteDto.email, 
                store_id
            );

            if (existingInvitation) {
                throw new Error('There is already a pending invitation for this email address');
            }

            const token = this.generateInvitationToken();
            const expires_at = inviteDto.expires_at || addDays(new Date(), 7);
            
            console.log(`Invitation created for ${inviteDto.email} with token: ${token}`);
            
            const store = await this.storeRepository.findById(store_id);
            const inviter = await this.userRepository.findById(invited_by_id);
            if (!store) {
                throw new Error(`La tienda con id ${store_id} no existe!`);
            }
            if (!inviter) {
                throw new Error(`El usuario con id ${invited_by_id} no existe!`);
            }
            const userToInvite = await this.userRepository.findByEmail(inviteDto.email);
            if (!userToInvite) {
                throw new Error(`El usuario con email ${inviteDto.email} no existe!`);
            }
            const role = await this.roleRepository.findUnique(inviteDto.role_id);
            if (!role) {
                throw new Error(`El rol con id ${inviteDto.role_id} no existe!`);
            }

            const invitation = await this.memberRepository.inviteMember({
                email: inviteDto.email.trim(),
                store_id,
                role_id: inviteDto.role_id,
                invited_by_id,
                token,
                expires_at
            });
            
            try {
                 const emailPromise = this.emailService.sendInvitationEmail(
                        inviteDto.email,
                        token,
                        store.getName(),
                        `${inviter.nameValue} ${inviter.lastNameValue}`,
                        role.name,
                        '',
                        inviteDto.message?.trim()
                    );
                    
                    Promise.all([emailPromise]).then(() => {
                        console.log(`[EMAIL] Invitation email sent to ${inviteDto.email}`);
                    });
                } catch (emailError) {
                    console.error('Failed to send invitation email:', emailError);
                }

            return success(invitation);
        } catch (error) {
            return failure(error);
        }
    }

    private generateInvitationToken(): string {
        return randomUUID();
    }
}
