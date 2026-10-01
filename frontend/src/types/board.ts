import { Project } from './project';
import { Task } from './task';

export interface BoardColumn {
  id: number;
  boardId: number;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface Board {
  id: number;
  projectId: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  columns?: BoardColumn[];
  _count?: {
    columns: number;
  };
}

export interface CreateBoardDto {
  projectId: number;
  name: string;
  description?: string;
}

export interface UpdateBoardDto {
  name?: string;
  description?: string;
}

export interface CreateColumnDto {
  boardId: number;
  name: string;
  position?: number;
}

export interface UpdateColumnDto {
  name?: string;
  position?: number;
}

