import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "../api/postsApi";

export const postsKey = () => ["posts"];

export const usePosts = () => {
  const query = useQuery({
    queryKey: postsKey(),
    queryFn: fetchPosts,
  });

  return {
    query,
    posts: query.data,
  };
};
