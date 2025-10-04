import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { endOfDay, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { FilterGetAdjustmentsDto } from "../infrastructure/dtos/filter-get-adjustments.dto";
import { AdjustmentReason } from "@prisma/client";

type AdjustmentCriteria = {
    where: Prisma.inventory_adjustmentsWhereInput;
    orderBy: Prisma.inventory_adjustmentsOrderByWithRelationInput[];
}

@Injectable()
export class AdjustmentCriteriaBuilder {

    build(filters: FilterGetAdjustmentsDto): AdjustmentCriteria {
        const where = this.buildWhereClause(filters);
        const orderBy = this.buildOrderByClause(filters);

        return { where, orderBy };
    }

    private buildWhereClause(filters: FilterGetAdjustmentsDto): Prisma.inventory_adjustmentsWhereInput {
        const where: Prisma.inventory_adjustmentsWhereInput = {
            store_id: filters.store_id
        };

        const dateFilter = this.buildDateFilter(filters);
        if (Object.keys(dateFilter).length > 0) {
            where.created_at = dateFilter;
        }

        const reasonFilters = this.buildReasonFilters(filters);
        if (reasonFilters.length > 0) {
            where.reason = { in: reasonFilters };
        }

        return where;
    }

    private buildOrderByClause(filters: FilterGetAdjustmentsDto): Prisma.inventory_adjustmentsOrderByWithRelationInput[] {
        const sortOrder = filters.dateDesc === false ? 'asc' : 'desc';
        return [{ created_at: sortOrder }];
    }

    private buildDateFilter(filters: FilterGetAdjustmentsDto): Prisma.DateTimeFilter {
        const dateFilter: Prisma.DateTimeFilter = {};

        if (filters.today) {
            return { gte: startOfDay(new Date()), lte: endOfDay(new Date()) };
        }
        if (filters.thisWeek) {
            return { gte: startOfWeek(new Date(), { weekStartsOn: 1 }), lte: endOfWeek(new Date(), { weekStartsOn: 1 }) };
        }
        if (filters.thisMonth) {
            return { gte: startOfMonth(new Date()), lte: endOfMonth(new Date()) };
        }
        if (filters.adjustmentDateRange_start) {
            dateFilter.gte = startOfDay(filters.adjustmentDateRange_start);
        }
        if (filters.adjustmentDateRange_end) {
            dateFilter.lte = endOfDay(filters.adjustmentDateRange_end);
        }

        return dateFilter;
    }

    private buildReasonFilters(filters: FilterGetAdjustmentsDto): AdjustmentReason[] {
        const reasons: AdjustmentReason[] = [];
        if (filters.DAMAGED) reasons.push(AdjustmentReason.DAMAGED);
        if (filters.LOST) reasons.push(AdjustmentReason.LOST);
        if (filters.EXPIRED) reasons.push(AdjustmentReason.EXPIRED);
        if (filters.INTERNAL_USE) reasons.push(AdjustmentReason.INTERNAL_USE);
        if (filters.RETURN_TO_SUPPLIER) reasons.push(AdjustmentReason.RETURN_TO_SUPPLIER);
        if (filters.OTHER) reasons.push(AdjustmentReason.OTHER);
        return reasons;
    }
}
