import { createContext } from "react";
import { Task } from "../../types/types";

export const MAX_RECENT_TASKS = 5;

export interface RecentTasksContextType {
  recentTasks: Task[];
  onTaskUpdated: (task: Task) => void;
}

export const RecentTasksContext = createContext<RecentTasksContextType | null>(
  null
);
