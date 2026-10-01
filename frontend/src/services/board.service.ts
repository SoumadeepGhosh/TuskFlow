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
      { data?: PaginatedResponse<Board> } & PaginatedResponse<Board>
    >('/boards', { params });
    return (res?.data ?? res) as PaginatedResponse<Board>;
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
      { data?: PaginatedResponse<BoardColumn> } & PaginatedResponse<BoardColumn>
    >(`/boards/${boardId}/columns`);
    return (res?.data ?? res) as PaginatedResponse<BoardColumn>;
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
};

