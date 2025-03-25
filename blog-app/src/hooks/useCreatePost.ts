import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../api/postsApi";
import { postsKey } from "./usePosts";
import { Post } from "../api/model";

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: [...postsKey()] });
      const previousPosts = queryClient.getQueryData<Post[]>([...postsKey()]);
      queryClient.setQueryData([...postsKey()], (old: Post[]) => [
        ...old,
        newPost,
      ]);
      return { previousPosts };
    },
    onSettled(_data, _error, _variables, context) {
      if (context?.previousPosts) {
        queryClient.setQueryData([...postsKey()], context.previousPosts);
      }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData([...postsKey()], context.previousPosts);
      }
    },
    onSuccess: async () => {
      // Invalidate and refetch posts list query after successful creation
      await queryClient.invalidateQueries({ queryKey: [...postsKey()] });
    },
  });

  const { isPending, error, mutateAsync } = createPostMutation;

  return {
    createPost: mutateAsync,
    pending: isPending,
    error,
  };
};
