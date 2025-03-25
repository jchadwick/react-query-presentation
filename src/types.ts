export interface Project {
  id: string;
  name: string;
  description: string;
}

export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt?: string;
}

export type NewTask = Omit<Task, "id" | "createdAt" | "updatedAt">;
export type UpdatedTask = Partial<NewTask>;
