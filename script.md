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

1. the network call is made (and takes a few seconds) and the task status is eventually updated in the UI
2. Whenever a task is modified it shows up in this "Recently Updated" task list in the sidebar

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

## Review the problems

[ Open problems.html ]

So, we've got a few problems here:

1. We're managing loading and error states manually (with a lot of boilerplate)
2. We're data fetching directly in the components
3. We have no caching of that fetched data
4. We're breaking separation of concerns by using a global context to manage the recent tasks list and having the components that update tasks explicitly updating that shared context

There are a few other opportunities for improvement, too.  
Things that are kinda difficult to do with basic React alone like:

- Optimistic updates
- Prefetching

So let's see how we can use React Query to solve these problems.

## React Query Setup

I'm going to start by installing the React Query library...

[ `npm install @tanstack/react-query` ]

Then, we need to configure the QueryClient and provider.
We'll do that in the App.tsx, like this:

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
```

## Convert data fetching to use React Query

Now, let's convert the data fetching to use React Query.

[ Open ProjectDetails.tsx ]

I'm going to start by removing all the manual state management.

[ Remove tasks, isLoading, error states, and all references to them ]

I'm going to leave the showTaskForm state alone, since that is actually part of this component's UI state.

I'm also going to leave the useRecentTasks hook alone for now - we'll get to that later.

Since I'm going to be using the same data fetching operation, just wrapping in React Query, I'm going to copy the current api call...

[ Copy api call ]

Then, I'll delete the useEffect hook, and replace all of this with a React Query hook:

[ Delete useEffect ]
[ Replace with React Query hook ]

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

Note the queryKey I'm using and how it is a hierarchical structure, marking the tasks as a child of the project.

Also notice how if I scroll down to the TaskList I'm getting a TypeScript error because the TaskList is expecting a tasks prop of type Task[], however the tasks object could be undefined.

That's because the first time the data is loading, the tasks object will be undefined. However, since we are looking at the isLoading state and rendering a loading state, we don't need to worry about that.

[Update `tasks={tasks}` to `tasks={tasks || []}]

[ Switch to browser, open network tab, click on a project ]

Now we can run the app and see that as we navigate to each project, the tasks are loaded and the loading state is working.

[ Select other projects, then back to the original project ]

Also notice how if we go back to a project we've already been to, the tasks are loaded from the cache and the network call is not made.

So right off the bat, without really any configuration or advanced features, we've already got a few benefits like cleaner code and built-in caching.

## useSuspenseQuery

As a matter of fact, you don't even need to handle the loading or error states explicitly if you use the useSuspenseQuery hook.
Let me convert the ProjectList to show you.

[ Open ProjectList.tsx ]

First, convert the states into a query, like this:

```typescript
const query = useSuspenseQuery({
  queryKey: ["projects"],
  queryFn: () => api.getProjects(),
});
```

Then, in order to implement Suspense we're going to wrap this component in another component that uses the Suspense fallback to render a loading state.

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

[ Run the app and show it working ]

If I reload the page I can still see the loading state that's rendered in the Suspense component.

Now, let's see what happens when the query fails.

```typescript
queryFn: () => {
  console.info("loading projects...");
  throw new Error("Failed to load projects");
},
```

[ Reload page and show error ]

When I reload the page I can see the loading state while it attempts to load the projects.  I can also see that React Query automatically retries the query a few times before giving up and finally showing the error in the console.

Now I didn't handle the error state so the whole app kinda blows up, but if I click on this link in the error I can see the docs for how to implement an error boundary to display the error message and potentially even try to recover from it.

[ Open error boundary docs ]


## Convert mutations to use React Query

Now that we've fetched data, let's see how to modify it.

[ Open ProjectDetails.tsx ]

We're going to replace each of these CRUD functions with a React Query mutation hook.

Let's start with the createTask function.
Instead of replacing the whole function, I'm just going to create the mutation first:

```typescript
const createTaskMutation = useMutation({
  mutationFn: (task: NewTask) => api.createTask(task),
});
```

Then I'll update the createTask function to use the mutation.
To start, I'll just replace the API call with the mutation function:

```typescript
const createdTask = await createTaskMutation.mutateAsync(newTask);
```

Now let's see if it works...

[ Run the app, switch to browser, open network tab, click on a project, create a task ]

So, it kind of works. We can see the network call is made and the task is created. We even see it in the Recent Tasks list. However, we don't see it in the task list until we go to another project and then come back.

[ Select another project, then back to the original project ]

That's because the tasks for this project are not invalidated when the task is created. So, let's update the mutation to do this.

In order to do this, we'll need to get the queryClient from the context.

```typescript
const queryClient = useQueryClient();
```

I'm also going to create a reusable query key for the project tasks:

```typescript
const queryKey = ["projects", projectId, "tasks"];
```

Then, we can use it to invalidate the tasks query for this project.

````typescript
const createTaskMutation = useMutation({
    mutationFn: (task: NewTask) => api.createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
```

Now, let's try again...

[ Reload the page, add a new task, and watch it appear in the task list ]

Ok, that works.  While we're here I'm also going to move the call to onTaskUpdated (updating the recently updated tasks) into the success callback, too:

```typescript
onSuccess: (newTask) => {
  onTaskUpdated(newTask);
  queryClient.invalidateQueries({ queryKey });
},
```

I'll quickly refactor the update and delete functions to do the same thing...

```typescript
  const updateTaskMutation = useMutation({
    mutationFn: (updatedTask: UpdatedTask) =>
      api.updateTask(updatedTask.id, updatedTask),
    onSuccess: (task: Task) => {
      onTaskUpdated(task);
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // ...

  <TaskList
    tasks={tasks ?? []}
    onUpdateTask={updateTaskMutation.mutate}
    onDeleteTask={deleteTaskMutation.mutate}
  />
```

Now let's just make sure it all works...

[ Run the app, update a task, delete a task, and watch the Recent Tasks list and task list update ]

## Optimistic updates

Alright, that looks great, but it's still slow.  Let's add optimistic updates to the mix.

[ Open ProjectDetails.tsx ]

We do this by adding a few more properties to the mutation.

I'll start by adding onMutate, which is called when the mutation starts.

```typescript
onMutate: async (updatedTask) => {},
```

The first thing we do is cancel any outgoing refetches so the cached data doesn't change form under us.

```typescript
await queryClient.cancelQueries({ queryKey });
```

Then, we snapshot the previous value of the tasks query.

```typescript
const previousTasks = queryClient.getQueryData<Task[]>(queryKey);
```

Then, we manually update the existing in-memory query data with the new task.

```typescript
queryClient.setQueryData<Task[]>(queryKey, (old: Task[]) =>
  old.map((task) => (task.id === updatedTask.id ? updatedTask : task))
);
```

And finally, we return the previous value so that we can roll back if the server request fails.

```typescript
return { previousTasks };
```

Now, let's see if it works...

[ Run the app, update a task, and see the task list update ]

Ok, so that updates the task list immediately, but if the server request fails, we need to roll back the in-memory update.
To do this, we add an onError callback.

```typescript
onError: (_err, _task, context) => {
  queryClient.setQueryData(queryKey, context?.previousTasks);
},
```

This pulls that previous value that we returned in the onMutate callback and uses it to manually update the cached query data again, effectively rolling back the in-memory update.

And, just for consistency, let's invalidate the cached data regardless of whether the server request succeeds or fails.
For that, we'll use the onSettled callback.

```typescript
onSettled: () => {
  queryClient.invalidateQueries({ queryKey });
},
```

And that's it!  We've got optimistic updates working.

Now this might look like a lot of code, but this is actually a pretty complex workflow that would require so many more lines of code if we were doing it manually.  React Query is handling so much of the complexity for us.

## Refactoring to custom hooks

Before we get to prefetching, let me first refactor this to get all of the data fetching logic out of the components and into custom hooks.

To do that, I'm simply going to cut all of this react query code...

[ Cut the code ]

...and paste it into a new hook.

[ Create src/hooks/useTasks.ts, with a hook.  Refactor as needed ]

```typescript
export const projectTasksQueryKey = (projectId: string) => [
  "projects",
  projectId,
  "tasks",
];

export const useTasksByProjectId = (projectId: string) =>
  useQuery({
    queryKey: projectTasksQueryKey(projectId),
    queryFn: () => api.getTasksByProjectId(projectId),
  });

export const useTaskMutators = (projectId: string) => {
//...
}
```

Then, plug it back into the ProjectDetails component.

```typescript
  const { data: tasks, isLoading, error } = useTasksByProjectId(projectId);
  const { createTaskMutation, updateTaskMutation, deleteTaskMutation } =
    useTaskMutators(projectId);
```

First off, let's take a second to appreciate how much cleaner this is.
We've got all of the data fetching logic out of the component and into a custom hook that largely abstracts away all of the React Query boilerplate, including the updating of the recently updated tasks list, so this component no longer needs to know about doing that.

In all honestly, I typically take the next step and completely abstract away all React Query stuff - like only returning the actual data, loading indicators, and create, update, delete functions that are wrappers around the mutators.
But, exposing the query and mutators directly does provide a lot of flexibility, so I don't necessarily consider it an anti-pattern.



## Prefetching

Cached query data and optimistic updates are great, but we still have to wait a few seconds for each of the task lists to load as we navigate between projects.

To fix this, let's implement some prefetching.

I'm going to start by creating a new hook that will fetch all of the tasks (regardless of project).

[ Create src/hooks/useTasks.ts ]

```typescript
export const useTasks = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["tasks"],
    queryFn: () => api.getTasks(),
  });

  return query;
};
```

This is nothing new, it's just a normal query.
But, since we've retrieved all tasks for all projects, we can use that data to pre-populate the query keys for each project, like this:

```typescript
  useEffect(() => {
    const tasks = query.data;

    if (tasks) {
      // Group tasks by project ID
      const tasksByProject = tasks.reduce((acc, task) => {
        if (!acc[task.projectId]) {
          acc[task.projectId] = [];
        }
        acc[task.projectId].push(task);
        return acc;
      }, {} as Record<string, Task[]>);

      // Store each project's tasks in the query cache (by projectId)
      Object.entries(tasksByProject).forEach(([projectId, projectTasks]) => {
        console.log("populating project tasks cache for project", projectId);
        queryClient.setQueryData(projectTasksQueryKey(projectId), projectTasks);
      });
    }
  }, [query.data, queryClient]);
```

With this available, we can use it to prefetch the tasks when the project list first loads:

[ Open ProjectList.tsx ]

```typescript
useTasks();
```

## Replacing global context with React Query

That's all the functionality I'm going to show in this demo, however before we're done, let me show you one more thing.

[ Open App.tsx, highlight the RecentTasksProvider ]

I really find Context and Providers to be a bit of an anti-pattern, or at the very least something that can be very easily abused, so I try use it very sparingly.

And this implementation of the recent tasks list is a perfect example of something that can be easily refactored to use React Query.

[ Delete the <RecentTasksProvider> ]

[ Delete RecentTasksContext.tsx ]

[ Copy onTaskUpdated from RecentTasksProvider.tsx, then delete it ]
[ Paste function into useRecentTasks.tsx ]

```typescript
export function useRecentTasks() {
  const query = useQuery({
    queryKey: ["recentTasks"],
    queryFn: () => [] as Task[], // start out empty
  });

  const onTaskUpdated = (task: Task) => {
    queryClient.setQueryData(queryKey, (prev: Task[]) => {
      // Remove the task if it's already in the list
      const filtered = prev.filter((t) => t.id !== task.id);
      // Add the task to the beginning and limit the list size
      return [task, ...filtered].slice(0, 5);
    });
  };

  return {
    recentTasks: query.data ?? [],
    onTaskUpdated,
  };
}
```

And like that, we've replaced the global context with React Query.

You might be complaining that I've just switched one global state to another, and you'd be right.  But, at least its completely self-contained right now, and we can change the implementation details later.

And since you're right, let's change this function to actually watch for task changes and update itself accordingly, removing the need for other components to call the onTaskUpdated function.

```typescript
export function useRecentTasks() {
  const queryClient = useQueryClient();

  const isProjectTasksQuery = (query: Query) =>
    // find query keys like ["projects", <whatever>, "tasks"]
    query.queryKey[0] === "projects" && query.queryKey[2] === "tasks";

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && isProjectTasksQuery(event.query)) {
        console.log("refetching recent tasks");
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
        .findAll({ predicate: isProjectTasksQuery }) // cached project tasks
        .flatMap((query) => query.state.data as Task[]) // strongly typed to Task[]
        .filter((task) => !!task.updatedAt) // have been updated
        .sort(
          // sort by update timestamp (descending)
          (a, b) =>
            new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
        )
        .slice(0, 5), // return the most recent 5 tasks
  });

  return {
    recentTasks: query.data ?? [],
  };
}
```
````
