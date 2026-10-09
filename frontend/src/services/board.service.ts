import { apiClient } from '@/lib/axios';
import {
  Board,
  BoardColumn,
  CreateBoardDto,
  CreateColumnDto,
  UpdateBoardDto,
  UpdateColumnDto,
} from '@/types/board';
import { PaginatedResponse } from '@/types/api';

export const boardService = {
  async getBoards(params?: {
    projectId?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Board>> {
    const res = await apiClient.get<
      unknown,
      | { data?: PaginatedResponse<Board> | Board[] }
      | PaginatedResponse<Board>
      | Board[]
    >('/boards', { params });
    const payload = ((res as { data?: unknown })?.data ?? res) as
      | PaginatedResponse<Board>
      | Board[];
    if (Array.isArray(payload)) {
      return {
        items: payload,
        meta: {
          total: payload.length,
          page: params?.page ?? 1,
          limit: params?.limit ?? payload.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
    return payload;
  },

  async getBoard(id: number): Promise<Board> {
    const res = await apiClient.get<
      unknown,
      { data?: Board } & Board
    >(`/boards/${id}`);
    return (res?.data ?? res) as Board;
  },

  async createBoard(data: CreateBoardDto): Promise<Board> {
    const res = await apiClient.post<
      unknown,
      { data?: Board } & Board
    >('/boards', data);
    return (res?.data ?? res) as Board;
  },

  async updateBoard(id: number, data: UpdateBoardDto): Promise<Board> {
    const res = await apiClient.patch<
      unknown,
      { data?: Board } & Board
    >(`/boards/${id}`, data);
    return (res?.data ?? res) as Board;
  },

  async deleteBoard(id: number): Promise<{ message?: string }> {
    return apiClient.delete(`/boards/${id}`);
  },

  // Column APIs
  async getColumns(boardId: number): Promise<PaginatedResponse<BoardColumn>> {
    const res = await apiClient.get<
      unknown,
      | { data?: PaginatedResponse<BoardColumn> | BoardColumn[] }
      | PaginatedResponse<BoardColumn>
      | BoardColumn[]
    >(`/boards/${boardId}/columns`);
    const payload = ((res as { data?: unknown })?.data ?? res) as
      | PaginatedResponse<BoardColumn>
      | BoardColumn[];
    if (Array.isArray(payload)) {
      return {
        items: payload,
        meta: {
          total: payload.length,
          page: 1,
          limit: payload.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }
    return payload;
  },

  async createColumn(data: CreateColumnDto): Promise<BoardColumn> {
    const res = await apiClient.post<
      unknown,
      { data?: BoardColumn } & BoardColumn
    >('/columns', data);
    return (res?.data ?? res) as BoardColumn;
  },

  async updateColumn(id: number, data: UpdateColumnDto): Promise<BoardColumn> {
    const res = await apiClient.patch<
      unknown,
      { data?: BoardColumn } & BoardColumn
    >(`/columns/${id}`, data);
    return (res?.data ?? res) as BoardColumn;
  },

  async deleteColumn(id: number): Promise<{ message?: string }> {
    return apiClient.delete(`/columns/${id}`);
  },

  async uploadCover(
    id: number,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<Board> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<unknown, { data?: Board } & Board>(
      `/boards/${id}/cover`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(percent);
          }
        },
      },
    );
    return (res?.data ?? res) as Board;
  },

  async removeCover(id: number): Promise<Board> {
    const res = await apiClient.delete<unknown, { data?: Board } & Board>(
      `/boards/${id}/cover`,
    );
    return (res?.data ?? res) as Board;
  },
};

