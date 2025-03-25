import { useState, useEffect } from "react";
import { Title, Button, Group, Stack, Skeleton } from "@mantine/core";
import { Task } from "../types";
import * as api from "../api";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import { useRecentTasks } from "../contexts/RecentTasksContext";

interface ProjectDetailsProps {
  projectId: string;
}

function ProjectDetails({ projectId }: ProjectDetailsProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const { onTaskUpdated } = useRecentTasks();

  // Fetch tasks when project changes
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const tasks = await api.getTasks(projectId);
        setTasks(tasks);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const handleCreateTask = async (
    newTask: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const createdTask = await api.createTask(newTask);
      setTasks((prev) => [...prev, createdTask]);
      onTaskUpdated(createdTask);
      setShowTaskForm(false);
    } catch (err) {
      setError(err as Error);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await api.updateTask(id, updates);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      onTaskUpdated(updatedTask);
    } catch (err) {
      setError(err as Error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      setError(err as Error);
    }
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading) {
    return (
      <Stack>
        <Skeleton height={100} radius="md" />
        <Skeleton height={100} radius="md" />
        <Skeleton height={100} radius="md" />
      </Stack>
    );
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Project Tasks</Title>
        {!showTaskForm && (
          <Button onClick={() => setShowTaskForm(true)}>Add New Task</Button>
        )}
      </Group>
      <TaskForm
        projectId={projectId}
        onCreateTask={handleCreateTask}
        onCancel={() => setShowTaskForm(false)}
        show={showTaskForm}
      />
      <TaskList
        tasks={tasks}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />
    </>
  );
}

export default ProjectDetails;
