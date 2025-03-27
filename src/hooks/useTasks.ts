import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRecentTasks } from "../components/RecentTasks/useRecentTasks";
import { UpdatedTask, Task, NewTask } from "../types/types";
import * as api from "../lib/api";
import { useEffect } from "react";

export const useTasks = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["tasks"],
    queryFn: () => api.getTasks(),
  });

  useEffect(() => {
    const tasks = query.data;
    if (tasks) {
      const tasksByProject = tasks.reduce((acc, task) => {
        if (!acc[task.projectId]) {
          acc[task.projectId] = [];
        }
        acc[task.projectId].push(task);
        return acc;
      }, {} as Record<string, Task[]>);

      Object.entries(tasksByProject).forEach(([projectId, projectTasks]) => {
        queryClient.setQueryData(
          ["projects", projectId, "tasks"],
          projectTasks
        );
      });
    }
  }, [query.data, queryClient]);

  return query.data || [];
};

export const useTasksByProjectId = (projectId: string) => {
  const { onTaskUpdated } = useRecentTasks();

  const query = useQuery({
    queryKey: ["projects", projectId, "tasks"],
    queryFn: () => api.getTasksByProjectId(projectId),
    enabled: !!projectId,
  });

  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: (updated: UpdatedTask) => api.updateTask(updated.id, updated),
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({
        queryKey: ["projects", projectId, "tasks"],
      });

      // get the current data
      const cachedTasks = queryClient.getQueryData<Task[]>([
        "projects",
        projectId,
        "tasks",
      ]);

      // update in memory
      queryClient.setQueryData<Task[]>(
        ["projects", projectId, "tasks"],
        (old) =>
          old?.map((task) =>
            task.id === updatedTask.id ? (updatedTask as Task) : task
          )
      );

      return { cachedTasks };
    },
    onError: (error, variables, context) => {
      // rollback to previous state
      queryClient.setQueryData(
        ["projects", projectId, "tasks"],
        context?.cachedTasks
      );
    },
    onSuccess: (updatedTask) => {
      onTaskUpdated(updatedTask);
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "tasks"],
      });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (newTask: NewTask) => api.createTask(newTask),
    onSuccess: (createdTask) => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "tasks"],
      });
      onTaskUpdated(createdTask);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "tasks"],
      });
    },
  });

  return {
    query,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
  };
};
