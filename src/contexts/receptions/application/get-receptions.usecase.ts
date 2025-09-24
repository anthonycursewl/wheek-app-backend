import { Inject, Injectable } from "@nestjs/common";
import { RECEPTION_REPOSITORY, ReceptionRepository } from "../domain/repos/reception.repository";
import { Result, success, failure } from "@/src/contexts/shared/ROP/result";
import { ReceptionsWithItems } from "../domain/repos/reception.repository";
import { FilterAllReceptionDto } from "../infrastructure/dtos/filter-receptions.dto";
import { ReceptionCriteriaBuilder } from "../builders/reception-criteria.builder";

@Injectable()
export class GetAllReceptionsUseCase {
    constructor(
        @Inject(RECEPTION_REPOSITORY)
        private readonly receptionRepository: ReceptionRepository,
        private readonly receptionCriteriaBuilder: ReceptionCriteriaBuilder
    ) {}

    async execute(store_id: string, skip: number = 0, take: number = 10, filters: FilterAllReceptionDto): Promise<Result<ReceptionsWithItems[], Error>> {
        try {
            if (!store_id) throw new Error('Store ID is required')
            const criteria = this.receptionCriteriaBuilder.build(filters)
            const receptions = await this.receptionRepository.getAll(store_id, skip, take, criteria)
            return success(receptions)
        } catch (error) {
            return failure(error)
        }
    }   

}