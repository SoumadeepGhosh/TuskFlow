import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import {
  CreateBoardDto,
  CreateColumnDto,
  UpdateBoardDto,
  UpdateColumnDto,
} from '@/types/board';
import { boardService } from '@/services/board.service';

export const BOARD_KEYS = {
  all: ['boards'] as const,
  lists: () => [...BOARD_KEYS.all, 'list'] as const,
  list: (params?: { projectId?: number; page?: number; limit?: number }) =>
    [...BOARD_KEYS.lists(), params] as const,
  details: () => [...BOARD_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...BOARD_KEYS.details(), id] as const,
  columns: (boardId: number) => [...BOARD_KEYS.detail(boardId), 'columns'] as const,
};

export function useBoards(params?: {
  projectId?: number;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: BOARD_KEYS.list(params),
    queryFn: () => boardService.getBoards(params),
  });
}

export function useBoard(id: number) {
  return useQuery({
    queryKey: BOARD_KEYS.detail(id),
    queryFn: () => boardService.getBoard(id),
    enabled: !!id && !isNaN(id),
  });
}

export function useBoardColumns(boardId: number) {
  return useQuery({
    queryKey: BOARD_KEYS.columns(boardId),
    queryFn: () => boardService.getColumns(boardId),
    enabled: !!boardId && !isNaN(boardId),
  });
}

export function useCreateBoardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBoardDto) => boardService.createBoard(data),
    onSuccess: (newBoard) => {
      toast.success(`Board "${newBoard.name}" created!`);
      void queryClient.invalidateQueries({ queryKey: BOARD_KEYS.lists() });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to create board';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useUpdateBoardMutation(boardId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBoardDto) => boardService.updateBoard(boardId, data),
    onSuccess: () => {
      toast.success('Board updated');
      void queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
      void queryClient.invalidateQueries({ queryKey: BOARD_KEYS.lists() });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to update board';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useDeleteBoardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => boardService.deleteBoard(id),
    onSuccess: () => {
      toast.success('Board deleted');
      void queryClient.invalidateQueries({ queryKey: BOARD_KEYS.lists() });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete board';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useCreateColumnMutation(boardId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateColumnDto) => boardService.createColumn(data),
    onSuccess: () => {
      toast.success('Column added');
      void queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to create column';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useUpdateColumnMutation(boardId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateColumnDto }) =>
      boardService.updateColumn(id, data),
    onSuccess: () => {
      toast.success('Column updated');
      void queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to update column';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export function useDeleteColumnMutation(boardId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => boardService.deleteColumn(id),
    onSuccess: () => {
      toast.success('Column deleted');
      void queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
    },
    onError: (error: AxiosError<ApiError>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete column';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    },
  });
}

export const useCreateColumn = useCreateColumnMutation;
export const useUpdateColumn = useUpdateColumnMutation;
export const useDeleteColumn = useDeleteColumnMutation;
