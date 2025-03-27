import { Button, Group, Skeleton, Stack, Title } from "@mantine/core";
import { useState } from "react";
import { useTasksByProjectId } from "../hooks/useTasks";
import { NewTask } from "../types/types";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";

interface ProjectDetailsProps {
  projectId: string;
}

function ProjectDetails({ projectId }: ProjectDetailsProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const {
    query: { data: tasks, isLoading, error },
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
  } = useTasksByProjectId(projectId);

  const handleCreateTask = async (newTask: NewTask) => {
    await createTaskMutation.mutateAsync(newTask);
    setShowTaskForm(false);
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
        tasks={tasks || []}
        onUpdateTask={updateTaskMutation.mutateAsync}
        onDeleteTask={deleteTaskMutation.mutateAsync}
      />
    </>
  );
}

export default ProjectDetails;
