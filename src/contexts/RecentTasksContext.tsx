import { createContext, useContext, useState, ReactNode } from 'react';
import { Task } from '../types';

const MAX_RECENT_TASKS = 5;

interface RecentTasksContextType {
  recentTasks: Task[];
  onTaskUpdated: (task: Task) => void;
}

const RecentTasksContext = createContext<RecentTasksContextType | null>(null);

export function useRecentTasks() {
  const context = useContext(RecentTasksContext);
  if (!context) {
    throw new Error('useRecentTasks must be used within a RecentTasksProvider');
  }
  return context;
}

interface RecentTasksProviderProps {
  children: ReactNode;
}

export function RecentTasksProvider({ children }: RecentTasksProviderProps) {
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);

  const onTaskUpdated = (task: Task) => {
    setRecentTasks(prev => {
      // Remove the task if it's already in the list
      const filtered = prev.filter(t => t.id !== task.id);
      // Add the task to the beginning and limit the list size
      return [task, ...filtered].slice(0, MAX_RECENT_TASKS);
    });
  };

  return (
    <RecentTasksContext.Provider value={{ recentTasks, onTaskUpdated }}>
      {children}
    </RecentTasksContext.Provider>
  );
} 