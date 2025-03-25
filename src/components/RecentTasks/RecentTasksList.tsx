import { Group, Paper, Stack, Text } from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import * as api from "../../lib/api";
import { Project, Task } from "../../types/types";
import { TaskStatusBadge } from "../TaskStatusBadge";
import { useRecentTasks } from "./useRecentTasks";

function RecentTasksList() {
  const { recentTasks } = useRecentTasks();

  return (
    <>
      <Text size="lg" fw={500} mb="md">
        Recently Updated Tasks
      </Text>
      <Stack>
        {recentTasks.length === 0 && (
          <Text size="sm" c="dimmed" ta="center">
            No recently updated tasks
          </Text>
        )}
        {recentTasks.map((task) => (
          <RecentTask key={task.id} task={task} />
        ))}
      </Stack>
    </>
  );
}

function RecentTask({ task }: { task: Task }) {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      const project = await api.getProject(task.projectId);
      setProject(project);
    };
    fetchProject();
  }, [task.projectId]);

  return (
    <Paper key={task.id} withBorder p="xs">
      <Group justify="space-between" mb={4}>
        <Text size="sm" fw={500} lineClamp={1}>
          {task.title}
        </Text>
        <TaskStatusBadge status={task.status} />
      </Group>
      <Group justify="space-between" mb={4} wrap="nowrap">
        <Text size="xs" c="dimmed">
          Updated{" "}
          {formatDistanceToNow(new Date(task.updatedAt || task.createdAt), {
            addSuffix: true,
          })}
        </Text>
        {project && (
          <Text size="xs" c="dimmed" fw={500} lineClamp={1} truncate="end">
            {project.name}
          </Text>
        )}
      </Group>
    </Paper>
  );
}

export default RecentTasksList;
