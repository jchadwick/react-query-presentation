import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPost, updatePost } from '../api/postsApi';
import { Post } from '../api/model';

const EditPostForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Convert id to number
  const postId = id ? parseInt(id, 10) : 0;

  // Fetch post details
  const { data: post, error, isLoading } = useQuery({
    queryKey: ['posts', postId],
    queryFn: () => fetchPost(postId),
    enabled: !!postId, // Only run query if we have a valid postId
  });

  // Update form fields when post data is loaded
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: (updatedPost: Partial<Post>) => updatePost(postId, updatedPost),
    onSuccess: (updatedPost) => {
      // Update the post in the cache
      queryClient.setQueryData(['posts', postId], updatedPost);
      
      // Invalidate and refetch posts list query
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      // Navigate to the updated post
      navigate(`/posts/${postId}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Update post
    updatePostMutation.mutate({ title, content });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-xl">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error loading post: {error instanceof Error ? error.message : 'Post not found'}</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Back to Posts
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Edit Post</h2>
      
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
        
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={updatePostMutation.isPending}
          >
            {updatePostMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          
          <Link
            to={`/posts/${postId}`}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </Link>
        </div>
        
        {updatePostMutation.isError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error updating post: {updatePostMutation.error instanceof Error ? updatePostMutation.error.message : 'Unknown error'}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default EditPostForm;
