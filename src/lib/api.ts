import axios from "axios";
import { NewTask, Project, Task, UpdatedTask } from "../types/types";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

const mimicLatency = (ms = 1500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getProjects = async (): Promise<Project[]> => {
  await mimicLatency();
  const { data } = await api.get("/projects");
  return data;
};

export const getProject = async (id: string): Promise<Project> => {
  await mimicLatency();
  const { data } = await api.get(`/projects/${id}`);
  return data;
};

export const getTasks = async (projectId: string): Promise<Task[]> => {
  await mimicLatency();
  const { data } = await api.get("/tasks", {
    params: { projectId },
  });
  return data;
};

export const createTask = async (task: NewTask): Promise<Task> => {
  await mimicLatency();
  const now = new Date().toISOString();
  const { data } = await api.post("/tasks", {
    ...task,
    createdAt: now,
    updatedAt: now,
  });
  return data;
};

export const updateTask = async (
  id: string,
  updates: UpdatedTask
): Promise<Task> => {
  await mimicLatency();
  const { data } = await api.patch(`/tasks/${id}`, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  return data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await mimicLatency();
  await api.delete(`/tasks/${id}`);
};
