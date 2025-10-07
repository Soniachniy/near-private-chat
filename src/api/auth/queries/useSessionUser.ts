import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { authClient } from "../client";

export const useSessionUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.sessionUser,
    queryFn: () => authClient.getSessionUser(),
  });
};
