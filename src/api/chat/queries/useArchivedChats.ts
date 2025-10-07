import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { chatClient } from "../client";
import { queryKeys } from "@/api/query-keys";
import type { Chat } from "@/types";

type UseArchivedChatsOptions = Omit<UseQueryOptions<Chat[], Error>, 'queryKey' | 'queryFn'>;

export const useArchivedChats = (options?: UseArchivedChatsOptions) => {
	return useQuery({
		queryKey: queryKeys.chat.archived,
		queryFn: () => chatClient.getArchivedChatList(),
		...options
	});
};
