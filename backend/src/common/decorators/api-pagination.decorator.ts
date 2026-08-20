import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiPagination() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      example: 1,
      description: 'Page number',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      example: 10,
      description: 'Items per page',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      example: 'TaskFlow',
      description: 'Search keyword',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      example: 'createdAt',
      description: 'Sort field',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      enum: ['ASC', 'DESC'],
      description: 'Sort order',
    }),
  );
}
