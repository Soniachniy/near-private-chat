import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import type { User } from "@/types";
import { usersClient } from "../client";

type UseUsersOptions = Omit<UseQueryOptions<User[], Error>, "queryKey" | "queryFn">;

export const useUsers = (options?: UseUsersOptions) => {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => usersClient.getUsers(),
    ...options,
  });
};
