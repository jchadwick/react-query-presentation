import { Badge } from "@mantine/core";
import { TaskStatus } from "../types/types";

const statusColors: Record<TaskStatus, string> = {
  pending: "yellow",
  in_progress: "blue",
  completed: "green",
};
export function TaskStatusBadge({ status }: { status: TaskStatus; }) {
  return <Badge color={statusColors[status]}>{status.replace("_", " ")}</Badge>;
}
