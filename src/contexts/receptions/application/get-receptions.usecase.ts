import { Inject, Injectable } from "@nestjs/common";
import { RECEPTION_REPOSITORY, ReceptionRepository } from "../domain/repos/reception.repository";
import { Result, success, failure } from "@/src/contexts/shared/ROP/result";
import { ReceptionsWithItems } from "../domain/repos/reception.repository";

@Injectable()
export class GetAllReceptionsUseCase {
    constructor(
        @Inject(RECEPTION_REPOSITORY)
        private readonly receptionRepository: ReceptionRepository
    ) {}

    async execute(store_id: string): Promise<Result<ReceptionsWithItems[], Error>> {
        try {
            if (!store_id) throw new Error('Store ID is required')
            const receptions = await this.receptionRepository.getAll(store_id)
            return success(receptions)
        } catch (error) {
            return failure(error)
        }
    }
}