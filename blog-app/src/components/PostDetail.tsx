import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchPost, deletePost } from "../api/postsApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Convert id to number
  const postId = id ? parseInt(id, 10) : 0;

  // Fetch post details
  const {
    data: post,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["posts", postId],
    queryFn: () => fetchPost(postId),
    enabled: !!postId, // Only run query if we have a valid postId
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      // Invalidate and refetch posts list query
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePostMutation.mutateAsync(postId);
      // Navigate back to the posts list
      navigate("/");
    }
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
        <p>
          Error loading post:{" "}
          {error instanceof Error ? error.message : "Post not found"}
        </p>
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
        >
          Back to Posts
        </Link>
      </div>
    );
  }

  return (
    <article className="prose lg:prose-xl max-w-none">
      <div className="mb-6">
        <Link to="/" className="text-blue-600 hover:text-blue-800">
          &larr; Back to Posts
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      <div className="text-gray-600 mb-6">
        Published on {new Date(post.createdAt).toLocaleDateString()}
      </div>

      <div className="whitespace-pre-line mb-8">{post.content}</div>

      <div className="flex gap-4 mt-8">
        <Link
          to={`/posts/${post.id}/edit`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Edit Post
        </Link>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          disabled={deletePostMutation.isPending}
        >
          {deletePostMutation.isPending ? "Deleting..." : "Delete Post"}
        </button>
      </div>
    </article>
  );
};

export default PostDetail;
