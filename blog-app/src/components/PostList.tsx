import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchPosts } from '../api/postsApi';

const PostList = () => {
  // Using useQuery to fetch posts
  const { data: posts, error, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-xl">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error loading posts: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Latest Posts</h2>
      {posts && posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="border border-gray-200 p-4 rounded shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-2">
                <Link to={`/posts/${post.id}`} className="text-blue-600 hover:text-blue-800">
                  {post.title}
                </Link>
              </h3>
              <p className="text-gray-600 mb-2 text-sm">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <p className="text-gray-700 line-clamp-2">{post.content}</p>
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/posts/${post.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Read more
                </Link>
                <Link
                  to={`/posts/${post.id}/edit`}
                  className="text-gray-600 hover:text-gray-800 ml-4"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No posts found. Create your first post!</p>
          <Link to="/posts/new" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            Add New Post
          </Link>
        </div>
      )}
    </div>
  );
};

export default PostList;
