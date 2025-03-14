import { useQuery } from "@tanstack/react-query";
import { fetchPost } from "../api/postsApi";
import { postsKey } from "./usePosts";

export const postKey = (postId: number) => [...postsKey(), postId];

export const usePost = (postId: number) => {
  const query = useQuery({
    queryKey: postKey(postId),
    queryFn: () => fetchPost(postId),
    enabled: !!postId, // Only run query if we have a valid postId
  });

  return {
    error: query.error,
    isLoading: query.isLoading,
    post: query.data,
    query,
  };
};
