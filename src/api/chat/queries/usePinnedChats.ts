import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { chatClient } from "../client";
import { queryKeys } from "@/api/query-keys";
import type { Chat } from "@/types";

type UsePinnedChatsOptions = Omit<UseQueryOptions<Chat[], Error>, 'queryKey' | 'queryFn'>;

export const usePinnedChats = (options?: UsePinnedChatsOptions) => {
	return useQuery({
		queryKey: queryKeys.chat.pinned,
		queryFn: () => chatClient.getPinnedChatList(),
		...options
	});
};
