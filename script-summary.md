# React Query Conversion Guide - Summary

## Demo App Overview 
- [Run app, click around]
- Simple task management system with projects containing tasks
- Network calls have intentional delay to demonstrate React Query benefits
- Features:
  - Project selection loads project tasks
  - Task status updates
  - Recently updated tasks list in sidebar
  - No caching implementation initially

## Initial Problems
- [/problems.html]
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
- [ ProjectDetails.tsx ]
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
- [ ProjectList.tsx ]
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
- [ ProjectList.tsx ]
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
- [ Create src/hooks/useTasks.ts ]
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
    enabled: !!projectId,
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
        queryClient.setQueryData(["projects", projectId, "tasks"], projectTasks);
      });
    }
  }, [query.data, queryClient]);

  return query;
};
```

## Replacing Context with React Query
- [ Remove RecentTasksProvider from App.tsx ]
- [ Delete RecentTasksContext.ts and RecentTasksProvider.ts ]
- Final implementation of recent tasks using React Query:
```typescript
export function useRecentTasks() {
  const queryClient = useQueryClient();

  const isProjectTasksQuery = (query: Query) =>
    // query key matches ["projects", <project id>, "tasks"]
    query.queryKey[0] === "projects" && query.queryKey[2] === "tasks";

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && isProjectTasksQuery(event.query)) {
        queryClient.invalidateQueries({ queryKey: ["recent-tasks"] });
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  const query = useQuery({
    queryKey: ["recent-tasks"],
    queryFn: () =>
      queryClient
        .getQueryCache()
        .findAll({ predicate: isProjectTasksQuery })  // find all cached project tasks
        .flatMap((query) => query.state.data as Task[]) // squash them into one array
        .filter((task) => !!task.updatedAt) // only get the ones that have been updated
        .sort(
          (a, b) =>
            // sort by updated time (desc)
            new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
        )
        .slice(0, 5),  // get the 5 most recent
  });

  return {
    recentTasks: query.data ?? [],
  };
}
``` 