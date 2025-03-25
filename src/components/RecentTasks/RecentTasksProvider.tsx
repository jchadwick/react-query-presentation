import { PropsWithChildren, useState } from "react";
import { Task } from "../../types/types";
import { MAX_RECENT_TASKS, RecentTasksContext } from "./RecentTasksContext";

export function RecentTasksProvider({ children }: PropsWithChildren<unknown>) {
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);

  const onTaskUpdated = (task: Task) => {
    setRecentTasks((prev) => {
      // Remove the task if it's already in the list
      const filtered = prev.filter((t) => t.id !== task.id);
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
