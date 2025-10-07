import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import type { SessionUser } from "@/types";
import { authClient } from "../client";

type UseSessionUserOptions = Omit<UseQueryOptions<SessionUser, Error>, "queryKey" | "queryFn">;

export const useSessionUser = (options?: UseSessionUserOptions) => {
  return useQuery({
    queryKey: queryKeys.auth.sessionUser,
    queryFn: () => authClient.getSessionUser(),
    ...options,
  });
};
