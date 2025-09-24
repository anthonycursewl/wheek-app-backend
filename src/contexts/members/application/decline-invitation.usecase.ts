import { Injectable, Inject } from "@nestjs/common";
import { MemberRepository } from "../domain/repos/member.repository";
import { Result, success, failure } from "../../shared/ROP/result";
import { MEMBER_REPOSITORY } from "../domain/repos/member.repository";

@Injectable()
export class DeclineInvitationUseCase {
    constructor(
        @Inject(MEMBER_REPOSITORY)
        private readonly memberRepository: MemberRepository
    ) {}

    async execute(token: string): Promise<Result<boolean, Error>> {
        try {
            const invitation = await this.memberRepository.findByToken(token);

            if (!invitation) {
                throw new Error('Invalid invitation token');
            }

            if (invitation.status !== 'PENDING') {
                throw new Error('Invitation is no longer valid');
            }

            await this.memberRepository.updateInvitationStatus(invitation.id, 'DECLINED');
            return success(true);
        } catch (error) {
            return failure(error);
        }
    }
}
