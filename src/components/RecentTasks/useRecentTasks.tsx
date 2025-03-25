import { useContext } from "react";
import { RecentTasksContext } from "./RecentTasksContext";

export function useRecentTasks() {
  const context = useContext(RecentTasksContext);
  if (!context) {
    throw new Error("useRecentTasks must be used within a RecentTasksProvider");
  }
  return context;
}
