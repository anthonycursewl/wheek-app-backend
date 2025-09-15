import { Inject, Injectable } from "@nestjs/common";
import { Result, success, failure } from "@/src/contexts/shared/ROP/result";
import { RECEPTION_REPOSITORY, ReceptionRepository } from "../domain/repos/reception.repository";
import { Reception } from "../domain/repos/reception.repository";

@Injectable()
export class CreateReceptionUseCase {
    constructor(
        @Inject(RECEPTION_REPOSITORY)
        private readonly receptionRepository: ReceptionRepository
    ) {}

    async execute(reception: Omit<Reception, 'id'>): Promise<Result<Reception, Error>> {
        try {
            if (reception.items.length === 0) {
                throw new Error('No se proporcionaron items para la recepción')
            }
            const newReception = await this.receptionRepository.create(reception)
            return success(newReception)
        } catch (error) {
            return failure(error)
        }
    }
}
