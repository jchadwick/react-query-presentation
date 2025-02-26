import { Post, NewPost } from './types';

// In a real application, this would be an actual API endpoint
// For this demo, we'll use a mock API with localStorage

// Initialize with some sample data if localStorage is empty
const initializeLocalStorage = (): void => {
  if (!localStorage.getItem('posts')) {
    const initialPosts: Post[] = [
      {
        id: 1,
        title: 'Getting Started with React Query',
        content: 'React Query is a powerful library for managing server state in React applications...',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Understanding Query Keys',
        content: 'Query keys are an essential concept in React Query that determine how your queries are cached...',
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        title: 'Mutations in React Query',
        content: 'Mutations are used to create/update/delete data or perform server side-effects...',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('posts', JSON.stringify(initialPosts));
  }
};

// Initialize localStorage when the module is imported
initializeLocalStorage();

// Helper to simulate network delay
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const fetchPosts = async (): Promise<Post[]> => {
  // Simulate network request
  await delay(500);
  const posts = localStorage.getItem('posts');
  return posts ? JSON.parse(posts) : [];
};

export const fetchPost = async (id: number): Promise<Post> => {
  await delay(500);
  const posts = localStorage.getItem('posts');
  const parsedPosts: Post[] = posts ? JSON.parse(posts) : [];
  const post = parsedPosts.find(p => p.id === id);
  
  if (!post) {
    throw new Error(`Post with id ${id} not found`);
  }
  
  return post;
};

export const createPost = async (newPost: NewPost): Promise<Post> => {
  await delay(500);
  const posts = localStorage.getItem('posts');
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
  localStorage.setItem('posts', JSON.stringify(updatedPosts));
  
  return post;
};

export const updatePost = async (id: number, updatedPost: Partial<Post>): Promise<Post> => {
  await delay(500);
  const posts = localStorage.getItem('posts');
  const parsedPosts: Post[] = posts ? JSON.parse(posts) : [];
  
  const postIndex = parsedPosts.findIndex(p => p.id === id);
  if (postIndex === -1) {
    throw new Error(`Post with id ${id} not found`);
  }
  
  const post = { ...parsedPosts[postIndex], ...updatedPost };
  parsedPosts[postIndex] = post;
  
  localStorage.setItem('posts', JSON.stringify(parsedPosts));
  
  return post;
};

export const deletePost = async (id: number): Promise<void> => {
  await delay(500);
  const posts = localStorage.getItem('posts');
  const parsedPosts: Post[] = posts ? JSON.parse(posts) : [];
  
  const updatedPosts = parsedPosts.filter(p => p.id !== id);
  localStorage.setItem('posts', JSON.stringify(updatedPosts));
};

// In a real application, you would use axios like this:
// export const fetchPosts = () => axios.get('/api/posts').then(res => res.data);
// export const fetchPost = (id: number) => axios.get(`/api/posts/${id}`).then(res => res.data);
// export const createPost = (newPost: NewPost) => axios.post('/api/posts', newPost).then(res => res.data);
// export const updatePost = (id: number, updatedPost: Partial<Post>) => axios.put(`/api/posts/${id}`, updatedPost).then(res => res.data);
// export const deletePost = (id: number) => axios.delete(`/api/posts/${id}`).then(res => res.data);
