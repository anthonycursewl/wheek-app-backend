import { Injectable } from "@nestjs/common";
import { Result, failure, success } from "../../shared/ROP/result";

@Injectable()
export class GenerateReportRangeUseCase {
    constructor() {}

    async execute(store_id: string, start_date: string, end_date: string): Promise<Result<any, Error>> {
        try {
            console.table([
                { 
                    'Campo': 'store_id', 
                    'Valor': store_id 
                },
                { 
                    'Campo': 'startDate_range', 
                    'Valor': start_date 
                },
                { 
                    'Campo': 'endDate_range', 
                    'Valor': end_date 
                }
            ]);
            return success({})
        } catch (error) {
            return failure(error as Error)
        }
    }
}