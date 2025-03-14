import { Post, NewPost } from "./model";

// In a real application, this would be an actual API endpoint
// For this demo, we'll use a mock API with localStorage

const getDate = (daysBeforeNow: number) =>
  new Date(Date.now() - daysBeforeNow * 24 * 60 * 60 * 1000).toISOString();

// Initialize with some sample data if localStorage is empty
const initializeLocalStorage = (): void => {
  if (!localStorage.getItem("posts")) {
    const initialPosts: Post[] = [
      {
        id: 1,
        title: "Getting Started with React Query",
        content:
          "React Query is a powerful library for managing server state in React applications...",
        createdAt: getDate(30),
      },
      {
        id: 2,
        title: "Understanding Query Keys",
        content:
          "Query keys are an essential concept in React Query that determine how your queries are cached...",
        createdAt: getDate(28),
      },
      {
        id: 3,
        title: "Mutations in React Query",
        content:
          "Mutations are used to create/update/delete data or perform server side-effects...",
        createdAt: getDate(27),
      },
      {
        id: 4,
        title: "Optimistic Updates in React Query",
        content:
          "Optimistic updates allow you to update the UI before the server request completes...",
        createdAt: getDate(26),
      },
      {
        id: 5,
        title: "React Query Devtools",
        content:
          "React Query Devtools is a set of utilities to help you debug and optimize your React Query usage...",
        createdAt: getDate(25),
      },
      {
        id: 6,
        title: "Caching Strategies with React Query",
        content:
          "Learn about different caching strategies and how to implement them with React Query...",
        createdAt: getDate(24),
      },
      {
        id: 7,
        title: "Paginated Queries in React Query",
        content:
          "Paginated queries help you manage large datasets by fetching data in chunks...",
        createdAt: getDate(23),
      },
      {
        id: 8,
        title: "Infinite Queries in React Query",
        content:
          "Infinite queries allow you to load more data as the user scrolls...",
        createdAt: getDate(22),
      },
      {
        id: 9,
        title: "React Query with TypeScript",
        content:
          "Using React Query with TypeScript provides type safety and better developer experience...",
        createdAt: getDate(21),
      },
      {
        id: 10,
        title: "React Query Best Practices",
        content:
          "Follow these best practices to get the most out of React Query in your applications...",
        createdAt: getDate(20),
      },
      {
        id: 11,
        title: "React Query and Suspense",
        content:
          "Learn how to use React Query with React Suspense for better loading states...",
        createdAt: getDate(19),
      },
      {
        id: 12,
        title: "React Query and SSR",
        content:
          "Server-side rendering with React Query can improve performance and SEO...",
        createdAt: getDate(18),
      },
      {
        id: 13,
        title: "React Query and GraphQL",
        content:
          "Integrate React Query with GraphQL for efficient data fetching...",
        createdAt: getDate(17),
      },
      {
        id: 14,
        title: "React Query and WebSockets",
        content:
          "Use WebSockets with React Query for real-time data updates...",
        createdAt: getDate(16),
      },
      {
        id: 15,
        title: "React Query and Redux",
        content: "Combine React Query with Redux for state management...",
        createdAt: getDate(15),
      },
      {
        id: 16,
        title: "React Query and Authentication",
        content: "Manage authentication state with React Query...",
        createdAt: getDate(14),
      },
      {
        id: 17,
        title: "React Query and Error Handling",
        content: "Implement robust error handling with React Query...",
        createdAt: getDate(13),
      },
      {
        id: 18,
        title: "React Query and Data Transformation",
        content: "Transform data on the client side with React Query...",
        createdAt: getDate(12),
      },
      {
        id: 19,
        title: "React Query and Data Normalization",
        content:
          "Normalize data for efficient state management with React Query...",
        createdAt: getDate(11),
      },
      {
        id: 20,
        title: "React Query and Data Synchronization",
        content:
          "Synchronize data between client and server with React Query...",
        createdAt: getDate(10),
      },
      {
        id: 21,
        title: "React Query and Offline Support",
        content: "Add offline support to your app with React Query...",
        createdAt: getDate(9),
      },
      {
        id: 22,
        title: "React Query and Performance Optimization",
        content: "Optimize the performance of your app with React Query...",
        createdAt: getDate(8),
      },
      {
        id: 23,
        title: "React Query and Code Splitting",
        content:
          "Use code splitting with React Query for better performance...",
        createdAt: getDate(7),
      },
      {
        id: 24,
        title: "React Query and Lazy Loading",
        content: "Implement lazy loading with React Query...",
        createdAt: getDate(6),
      },
      {
        id: 25,
        title: "React Query and Data Prefetching",
        content: "Prefetch data with React Query for faster load times...",
        createdAt: getDate(5),
      },
      {
        id: 26,
        title: "React Query and Data Pagination",
        content: "Implement data pagination with React Query...",
        createdAt: getDate(4),
      },
      {
        id: 27,
        title: "React Query and Data Sorting",
        content: "Sort data efficiently with React Query...",
        createdAt: getDate(3),
      },
      {
        id: 28,
        title: "React Query and Data Filtering",
        content: "Filter data with React Query...",
        createdAt: getDate(2),
      },
      {
        id: 29,
        title: "React Query and Data Aggregation",
        content: "Aggregate data with React Query...",
        createdAt: getDate(1),
      },
      {
        id: 30,
        title: "React Query and Data Visualization",
        content: "Visualize data fetched with React Query...",
        createdAt: getDate(0),
      },
    ];
    localStorage.setItem("posts", JSON.stringify(initialPosts));
  }
};

// Initialize localStorage when the module is imported
initializeLocalStorage();

// Helper to simulate network delay
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock API functions
export const fetchPosts = () => fetchPostsPaged().then((data) => data.posts);

export async function fetchPostsPaged(
  page: number = 1,
  pageSize: number = 5
): Promise<{ posts: Post[]; total: number; page: number; pageSize: number }> {
  // Simulate network request
  await delay(500);
  const postsString = localStorage.getItem("posts");
  const posts: Post[] = postsString ? JSON.parse(postsString) : [];

  posts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pagedPosts = posts.slice(start, end);

  return {
    posts: pagedPosts,
    total: posts.length,
    page,
    pageSize,
  };
}

export const fetchPost = async (id: number): Promise<Post> => {
  await delay(500);
  const posts = localStorage.getItem("posts");
  const parsedPosts: Post[] = posts ? JSON.parse(posts) : [];
  const post = parsedPosts.find((p) => p.id === id);

  if (!post) {
    throw new Error(`Post with id ${id} not found`);
  }

  return post;
};

export const createPost = async (newPost: NewPost): Promise<Post> => {
  await delay(500);
  const posts = localStorage.getItem("posts");
  const parsedPosts: Post[] = posts ? JSON.parse(posts) : [];

  // Generate a new ID (in a real app, the server would do this)
  const maxId = parsedPosts.reduce((max, post) => Math.max(max, post.id), 0);
  const id = maxId + 1;

  const post: Post = {
    id,
    ...newPost,
    createdAt: new Date().toISOString(),
  };

  const updatedPosts = [...parsedPosts, post];
  localStorage.setItem("posts", JSON.stringify(updatedPosts));

  return post;
};

export const updatePost = async (
  id: number,
  updatedPost: Partial<Post>
): Promise<Post> => {
  await delay(500);
  const posts = localStorage.getItem("posts");
  const parsedPosts: Post[] = posts ? JSON.parse(posts) : [];

  const postIndex = parsedPosts.findIndex((p) => p.id === id);
  if (postIndex === -1) {
    throw new Error(`Post with id ${id} not found`);
  }

  const post = { ...parsedPosts[postIndex], ...updatedPost };
  parsedPosts[postIndex] = post;

  localStorage.setItem("posts", JSON.stringify(parsedPosts));

  return post;
};

export const deletePost = async (id: number): Promise<void> => {
  await delay(500);
  const posts = localStorage.getItem("posts");
  const parsedPosts: Post[] = posts ? JSON.parse(posts) : [];

  const updatedPosts = parsedPosts.filter((p) => p.id !== id);
  localStorage.setItem("posts", JSON.stringify(updatedPosts));
};

// In a real application, you would use axios like this:
// export const fetchPosts = () => axios.get('/api/posts').then(res => res.data);
// export const fetchPost = (id: number) => axios.get(`/api/posts/${id}`).then(res => res.data);
// export const createPost = (newPost: NewPost) => axios.post('/api/posts', newPost).then(res => res.data);
// export const updatePost = (id: number, updatedPost: Partial<Post>) => axios.put(`/api/posts/${id}`, updatedPost).then(res => res.data);
// export const deletePost = (id: number) => axios.delete(`/api/posts/${id}`).then(res => res.data);
