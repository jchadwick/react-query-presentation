# React Query Conversion Guide - Summary

## Demo App Overview
- Simple task management system with projects containing tasks
- Network calls have intentional delay to demonstrate React Query benefits
- Features:
  - Project selection loads project tasks
  - Task status updates
  - Recently updated tasks list in sidebar
  - No caching implementation initially

## Initial Problems
- Manual loading and error state management
- Direct data fetching in components
- No data caching
- Global context usage for recent tasks
- Lack of optimistic updates
- No prefetching capability

## React Query Setup
1. Install React Query:
```bash
npm install @tanstack/react-query
```

2. Configure QueryClient in App.tsx:
```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
```

## Converting Data Fetching
- Replace manual state management with React Query hooks
- Basic query implementation:
```typescript
const {
  data: tasks,
  isLoading,
  error,
} = useQuery({
  queryKey: ["projects", projectId, "tasks"],
  queryFn: () => api.getTasks(projectId),
  enabled: !!projectId,
});
```

## Using Suspense
- Implementation using useSuspenseQuery:
```typescript
function ProjectList({ selectedProject, onSelectProject }: ProjectListProps) {
  return (
    <Suspense
      fallback={
        <Stack>
          <Skeleton height={100} radius="md" />
          <Skeleton height={100} radius="md" />
          <Skeleton height={100} radius="md" />
        </Stack>
      }
    >
      <ProjectListLoader
        selectedProject={selectedProject}
        onSelectProject={onSelectProject}
      />
    </Suspense>
  );
}

function ProjectListLoader({
  selectedProject,
  onSelectProject,
}: ProjectListProps) {
  const query = useSuspenseQuery({
    queryKey: ["projects"],
    queryFn: () => api.getProjects(),
  });

  return (
    <ProjectListView
      projects={query.data}
      selectedProject={selectedProject}
      onProjectSelected={onSelectProject}
    />
  );
}
```

## Mutations Implementation
- Basic mutation setup:
```typescript
const createTaskMutation = useMutation({
  mutationFn: (task: NewTask) => api.createTask(task),
  onSuccess: (newTask) => {
    onTaskUpdated(newTask);
    queryClient.invalidateQueries({ queryKey });
  },
});
```

## Optimistic Updates
- Implementation with rollback capability:
```typescript
const updateTaskMutation = useMutation({
  mutationFn: (updatedTask: UpdatedTask) =>
    api.updateTask(updatedTask.id, updatedTask),
  onMutate: async (updatedTask) => {
    await queryClient.cancelQueries({ queryKey });
    const previousTasks = queryClient.getQueryData<Task[]>(queryKey);
    queryClient.setQueryData<Task[]>(queryKey, (old: Task[]) =>
      old.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    return { previousTasks };
  },
  onError: (_err, _task, context) => {
    queryClient.setQueryData(queryKey, context?.previousTasks);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey });
  },
});
```

## Custom Hooks Refactoring
- Move query logic into custom hooks:
```typescript
export const projectTasksQueryKey = (projectId: string) => [
  "projects",
  projectId,
  "tasks",
];

export const useTasksByProjectId = (projectId: string) =>
  useQuery({
    queryKey: projectTasksQueryKey(projectId),
    queryFn: () => api.getTasks(projectId),
  });

export const useTaskMutators = (projectId: string) => {
  // mutation implementations
};
```

## Prefetching Implementation
- Create hook for all tasks:
```typescript
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
        queryClient.setQueryData(projectTasksQueryKey(projectId), projectTasks);
      });
    }
  }, [query.data, queryClient]);

  return query;
};
```

## Replacing Context with React Query
- Final implementation of recent tasks using React Query:
```typescript
export function useRecentTasks() {
  const queryClient = useQueryClient();

  const isProjectTasksQuery = (query: Query) =>
    query.queryKey[0] === "projects" && query.queryKey[2] === "tasks";

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && isProjectTasksQuery(event.query)) {
        queryClient.invalidateQueries({ queryKey: ["recentTasks"] });
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  const query = useQuery({
    queryKey: ["recentTasks"],
    queryFn: () =>
      queryClient
        .getQueryCache()
        .findAll({ predicate: isProjectTasksQuery })
        .flatMap((query) => query.state.data as Task[])
        .filter((task) => !!task.updatedAt)
        .sort(
          (a, b) =>
            new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
        )
        .slice(0, 5),
  });

  return {
    recentTasks: query.data ?? [],
  };
}
``` 