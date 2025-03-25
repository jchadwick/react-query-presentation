import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost } from "../api/postsApi";
import { postsKey } from "./usePosts";

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async () => {
      // Invalidate and refetch posts list query
      await queryClient.invalidateQueries({ queryKey: [...postsKey()] });
    },
  });

  return {
    deletePost: deletePostMutation.mutateAsync,
    deletePostPending: deletePostMutation.isPending,
  };
};
