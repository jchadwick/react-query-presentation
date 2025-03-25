import { useEffect, useState } from "react";
import { AppShell, Container, Grid, Title, Button, Group } from "@mantine/core";
import { Project, Task } from "./types";
import * as api from "./api";
import ProjectList from "./components/ProjectList";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Fetch projects on page load
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const data = await api.getProjects();
        setProjects(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch tasks when project is selected
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedProject) return;

      try {
        setIsLoading(true);
        const tasks = await api.getTasks(selectedProject.id);
        setTasks(tasks);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [selectedProject]);

  const handleCreateTask = async (newTask: Omit<Task, "id" | "createdAt">) => {
    try {
      const createdTask = await api.createTask(newTask);
      setTasks((prev) => [...prev, createdTask]);
      setShowTaskForm(false); // Hide form after successful creation
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

  function handleProjectSelected(project: Project): void {
    setSelectedProject(project);
    setShowTaskForm(false);
  }

  return (
    <AppShell>
      <Container size="xl">
        <Title order={1} mb="lg">
          TaskMaster
        </Title>
        <Grid>
          <Grid.Col span={3}>
            <ProjectList
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={handleProjectSelected}
              isLoading={isLoading}
            />
          </Grid.Col>
          <Grid.Col span={9}>
            {selectedProject && (
              <>
                <Group justify="space-between" mb="md">
                  <Title order={2}>{selectedProject.name}</Title>
                  {!showTaskForm && (
                    <Button onClick={() => setShowTaskForm(true)}>
                      Add New Task
                    </Button>
                  )}
                </Group>
                <TaskForm
                  projectId={selectedProject.id}
                  onCreateTask={handleCreateTask}
                  onCancel={() => setShowTaskForm(false)}
                  show={showTaskForm}
                />
                <TaskList
                  tasks={tasks}
                  isLoading={isLoading}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                />
              </>
            )}
            {error && <div>Error: {error.message}</div>}
          </Grid.Col>
        </Grid>
      </Container>
    </AppShell>
  );
}

export default App;
