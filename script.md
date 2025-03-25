# Converting a React App to React Query - Teaching Script

## Demo App intro
Let's take a look at the demo app.

[Run application: `npm start`]
[Open in browser]

It's a simple task management system with tasks grouped into "project" buckets.

Notice that I've deliberately added a delay to all the network calls just so that the benefits of converting to React Query will be that much more obvious later.

[Click on a Project]

When I click on a project it loads that project's tasks.

And then I can update their status...

[Update task status]

When I do that, two things happen: 

1) the network call is made (and takes a few seconds) and the task status is eventually updated in the UI
2) Whenever a task is modified it shows up in this "Recently Updated" task list in the sidebar

This recently updated list is across all projects, so when I update a task in another project, that shows up, too.

[ Select another Project, update a task status]

We also have no caching at all, so when I navigate around the projects, the tasks are loaded fresh every time - even the ones we've already loaded.

[ Select another Project, then the original Project ]

## Code intro

[ Open ProjectDetails.tsx ]

Now if we jump into the code, we can see it's using just the native React hooks, mostly useState to store component-level state and useEffect to load data into the state.

[ Highlight isLoading and error states ]

It handles all the loading and error states with explicit state getter/setters.

[ Go to definition of useRecentTasks ]

It also uses context to manage that shared list of recent tasks.


Our current app has several limitations:
1. managing loading and error states manually
2. no caching
3. writing a lot of boilerplate for data fetching
4. no automatic background updates
5. managing server state in the same way as UI state

## Step 1: Setup (5 minutes)
"First, let's set up React Query in our application. We already have it installed, but we need to configure the QueryClient and provider.

Let's modify our App.tsx to add the React Query provider. We'll place it outside our RecentTasks provider since it's more fundamental:"

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RecentTasksProvider>
        {/* existing content */}
      </RecentTasksProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

"The staleTime configuration means data will be considered fresh for 5 minutes, and refetchOnWindowFocus means we'll automatically check for updates when the user returns to our tab.

## Step 2: Create Query Hooks (10 minutes)
"Next, let's create custom hooks for our data fetching operations. This is a best practice that will make our queries reusable and easier to maintain. Create a new file called src/hooks/useTaskQueries.ts:"

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api';

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => api.getTasks(projectId),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createTask,
    onSuccess: (newTask) => {
      // Invalidate the tasks query for this project
      queryClient.invalidateQueries({ 
        queryKey: ['tasks', newTask.projectId] 
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => api.updateTask(id, updates),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ 
        queryKey: ['tasks', updatedTask.projectId] 
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteTask,
    onSuccess: (_, deletedTaskId) => {
      // We'll need to pass projectId in the variables to properly invalidate
      queryClient.invalidateQueries({ 
        queryKey: ['tasks'] 
      });
    },
  });
}
```

"Let's break down what we've done here:
1. We've created a query hook for fetching tasks
2. We've created mutation hooks for creating, updating, and deleting tasks
3. Each mutation automatically invalidates the relevant queries
4. We're using the queryClient to manage our cache

## Step 3: Refactor ProjectDetails (15 minutes)
"Now let's refactor our ProjectDetails component to use these hooks. This is where we'll see the biggest improvement:"

```typescript
function ProjectDetails({ projectId }: ProjectDetailsProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const { onTaskUpdated } = useRecentTasks();
  
  const { 
    data: tasks = [], 
    isLoading, 
    error 
  } = useTasks(projectId);
  
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleCreateTask = async (newTask: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    try {
      const createdTask = await createTask.mutateAsync(newTask);
      onTaskUpdated(createdTask);
      setShowTaskForm(false);
    } catch (err) {
      // React Query handles the error state
      console.error('Failed to create task:', err);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await updateTask.mutateAsync({ id, updates });
      onTaskUpdated(updatedTask);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  if (error) return <div>Error: {error.message}</div>;
  if (isLoading) return <LoadingState />;

  return (
    <>
      {/* existing JSX */}
    </>
  );
}
```

"Notice what's changed:
1. No more useState for tasks
2. No more manual loading state management
3. No more manual error state management
4. No more manual cache updates
5. Automatic background updates when data changes

## Step 4: Optimistic Updates (10 minutes)
"Let's improve the user experience by adding optimistic updates. This means we'll update the UI before the server confirms the change:"

```typescript
export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => api.updateTask(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      
      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['tasks']);
      
      // Optimistically update
      queryClient.setQueryData(['tasks'], (old: Task[]) => 
        old.map(task => task.id === id ? { ...task, ...updates } : task)
      );
      
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      // Roll back on error
      queryClient.setQueryData(['tasks'], context.previousTasks);
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ 
        queryKey: ['tasks', updatedTask.projectId] 
      });
    },
  });
}
```

"This gives us instant UI updates with a fallback if the server request fails.

## Step 5: Adding Prefetching (5 minutes)
"Finally, let's add prefetching to improve the user experience. In the ProjectList component, we can prefetch tasks when a user hovers over a project:"

```typescript
function ProjectList({ selectedProject, onSelectProject }: ProjectListProps) {
  const queryClient = useQueryClient();
  
  const handleProjectHover = (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['tasks', projectId],
      queryFn: () => api.getTasks(projectId),
    });
  };

  return (
    <ProjectListView
      // ... other props
      onProjectHover={handleProjectHover}
    />
  );
}
```

## Conclusion (5 minutes)
"Let's review what we've accomplished:
1. Simplified data management with React Query
2. Added automatic caching and background updates
3. Implemented optimistic updates for better UX
4. Added prefetching for faster navigation
5. Reduced boilerplate code significantly

The key benefits we've gained are:
1. More predictable data fetching
2. Better user experience
3. Less code to maintain
4. Automatic error and loading states
5. Built-in devtools for debugging

Questions?"
