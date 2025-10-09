import { type UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import type { User, UserRole } from "@/types";
import { usersClient } from "../client";

interface UpdateUserRoleParams {
  id: string;
  role: UserRole;
}

type UseUpdateUserRoleOptions = Omit<UseMutationOptions<User, Error, UpdateUserRoleParams>, "mutationFn">;

export const useUpdateUserRole = (options?: UseUpdateUserRoleOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: UpdateUserRoleParams) => usersClient.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    ...options,
  });
};
