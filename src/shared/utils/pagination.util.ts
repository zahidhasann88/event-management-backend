import { PaginationParams, PaginatedResponse } from '../interfaces/pagination.interface';

export class PaginationUtil {
  static getPaginationParams(params: PaginationParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(params.limit || 10, 100));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  static createPaginatedResponse<T>(
    data: T[],
    total: number,
    params: PaginationParams,
  ): PaginatedResponse<T> {
    const { page, limit } = this.getPaginationParams(params);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }
} 