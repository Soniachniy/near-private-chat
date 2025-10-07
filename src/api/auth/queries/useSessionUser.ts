import { useQuery } from "@tanstack/react-query";
import { authClient } from "../client";
import { queryKeys } from "@/api/query-keys";

export const useSessionUser = () => {
	return useQuery({
		queryKey: queryKeys.auth.sessionUser,
		queryFn: () => authClient.getSessionUser()
	});
};