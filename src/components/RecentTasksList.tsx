import { Paper, Text, Stack, Group } from "@mantine/core";
import { Task } from "../types";
import { formatDistanceToNow } from "date-fns";
import { TaskStatusBadge } from "./TaskStatusBadge";

interface RecentTasksListProps {
  tasks: Task[];
}

function RecentTasksList({ tasks }: RecentTasksListProps) {
  return (
    <>
      <Text size="lg" fw={500} mb="md">
        Recently Updated Tasks
      </Text>
      <Stack>
        {tasks.map((task) => (
          <Paper key={task.id} withBorder p="xs">
            <Group justify="space-between" mb={4}>
              <Text size="sm" fw={500} lineClamp={1}>
                {task.title}
              </Text>
              <TaskStatusBadge status={task.status} />
            </Group>
            <Text size="xs" c="dimmed">
              Updated{" "}
              {formatDistanceToNow(new Date(task.updatedAt || task.createdAt), {
                addSuffix: true,
              })}
            </Text>
          </Paper>
        ))}
        {tasks.length === 0 && (
          <Text size="sm" c="dimmed" ta="center">
            No recently updated tasks
          </Text>
        )}
      </Stack>
    </>
  );
}

export default RecentTasksList;
