import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api/postsApi';
import { NewPost } from '../api/model';

const AddPostForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (newPost: NewPost) => createPost(newPost),
    onSuccess: (newPost) => {
      // Invalidate and refetch posts list query
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // Navigate to the new post
      navigate(`/posts/${newPost.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Create new post
    createPostMutation.mutate({ title, content });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Create New Post</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
          </button>
        </div>
        
        {createPostMutation.isError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error creating post: {createPostMutation.error instanceof Error ? createPostMutation.error.message : 'Unknown error'}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddPostForm;
