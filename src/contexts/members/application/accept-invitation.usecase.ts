import { Injectable, Inject } from "@nestjs/common";
import { MemberRepository } from "../domain/repos/member.repository";
import { Member } from "../domain/entities/Member";
import { Invitation } from "../domain/entities/Invitation";
import { Result, success, failure } from "../../shared/ROP/result";
import { MEMBER_REPOSITORY } from "../domain/repos/member.repository";

@Injectable()
export class AcceptInvitationUseCase {
    constructor(
        @Inject(MEMBER_REPOSITORY)
        private readonly memberRepository: MemberRepository
    ) {}

    async execute(token: string, user_id: string): Promise<Result<Member, Error>> {
        try {
            const invitation = await this.memberRepository.findByToken(token);

            if (!invitation) {
                throw new Error('Invalid invitation token');
            }

            if (new Date() > invitation.expires_at) {
                await this.memberRepository.updateInvitationStatus(invitation.id, 'EXPIRED');
                throw new Error('Invitation has expired');
            }

            if (invitation.status !== 'PENDING') {
                throw new Error('Invitation is no longer valid');
            }

            await this.memberRepository.updateInvitationStatus(invitation.id, 'ACCEPTED');

            const member: Member = {
                id: invitation.id,
                user_id,
                store_id: invitation.store_id,
                role_id: invitation.role_id,
                is_active: true,
                created_at: invitation.created_at,
                user: {
                    name: '',
                    last_name: '',
                    username: '',
                    email: invitation.email,
                    icon_url: undefined
                },
                role: {
                    id: invitation.role.id,
                    name: invitation.role.name
                }
            };

            return success(member);
        } catch (error) {
            return failure(error);
        }
    }
}
