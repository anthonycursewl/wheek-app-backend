import { Injectable } from "@nestjs/common";
import { RECEPTION_REPOSITORY, ReceptionsWithItems } from "../domain/repos/reception.repository";
import { ReceptionRepository } from "../domain/repos/reception.repository";
import { failure, Result, success } from "@/src/contexts/shared/ROP/result";
import { Inject } from "@nestjs/common";

@Injectable()
export class DeleteReceptionUseCase {
    constructor(
        @Inject(RECEPTION_REPOSITORY)
        private readonly receptionRepository: ReceptionRepository
    ) {}

    async execute(id: string, isSoftDelete: boolean): Promise<Result<ReceptionsWithItems, Error>> {
        try {
            if (!id) throw new Error('Reception ID is required')
            const result = await this.receptionRepository.delete(id, isSoftDelete)
            return success(result)
        } catch (error) {
            return failure(error)
        }
    }
}