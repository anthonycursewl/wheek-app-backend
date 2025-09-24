import { Injectable, Inject } from "@nestjs/common";
import { MemberRepository } from "../domain/repos/member.repository";
import { GetAllMembersCriteria } from "../domain/entities/member.types";
import { Member } from "../domain/entities/Member";
import { Result, success, failure } from "../../shared/ROP/result";
import { MEMBER_REPOSITORY } from "../domain/repos/member.repository";

@Injectable()
export class GetAllMembersUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository
  ) {}

  async execute(store_id: string, skip: number = 0, take: number = 10, criteria?: GetAllMembersCriteria): Promise<Result<Member[], Error>> {
        try {
            if (!store_id) {
                throw new Error('Store ID is required');
            }
            if (skip < 0) {
                throw new Error('Skip must be greater than or equal to 0');
            }

            if (take < 1) {
                throw new Error('Take must be greater than 0');
            }

            const members = await this.memberRepository.getAll(store_id, skip, take, criteria);
            return success(members);
        } catch (error) {
            return failure(error);
        }
    }
}