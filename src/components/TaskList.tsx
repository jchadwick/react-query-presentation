import {
  Card,
  Stack,
  Text,
  Group,
  Badge,
  ActionIcon,
  Menu,
} from "@mantine/core";
import { Task } from "../types";
import { format } from "date-fns";
import { TaskStatusBadge } from "./TaskStatusBadge";

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

function TaskList({ tasks, onUpdateTask, onDeleteTask }: TaskListProps) {
  return (
    <Stack mt="lg">
      {tasks.map((task) => (
        <Card key={task.id} padding="md" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="lg" fw={500}>
              {task.title}
            </Text>
            <Group>
              <TaskStatusBadge status={task.status} />
              <Badge
                color={
                  task.priority === "high"
                    ? "red"
                    : task.priority === "medium"
                    ? "yellow"
                    : "gray"
                }
              >
                {task.priority}
              </Badge>
              <Menu>
                <Menu.Target>
                  <ActionIcon variant="subtle">⋮</ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Status</Menu.Label>
                  <Menu.Item
                    onClick={() => onUpdateTask(task.id, { status: "pending" })}
                  >
                    Set Pending
                  </Menu.Item>
                  <Menu.Item
                    onClick={() =>
                      onUpdateTask(task.id, { status: "in_progress" })
                    }
                  >
                    Set In Progress
                  </Menu.Item>
                  <Menu.Item
                    onClick={() =>
                      onUpdateTask(task.id, { status: "completed" })
                    }
                  >
                    Set Completed
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Label>Actions</Menu.Label>
                  <Menu.Item color="red" onClick={() => onDeleteTask(task.id)}>
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
          <Text size="sm">{task.description}</Text>
          <Text size="xs" c="dimmed" mt="xs">
            Created {format(new Date(task.createdAt), "PPp")}
          </Text>
        </Card>
      ))}
    </Stack>
  );
}

export default TaskList;
