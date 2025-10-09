import { type UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { usersClient } from "../client";

interface DeleteUserParams {
  id: string;
}

type UseDeleteUserOptions = Omit<UseMutationOptions<void, Error, DeleteUserParams>, "mutationFn">;

export const useDeleteUser = (options?: UseDeleteUserOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteUserParams) => usersClient.deleteUserById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    ...options,
  });
};
