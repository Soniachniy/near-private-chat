import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { chatClient } from "../client";
import { queryKeys } from "@/api/query-keys";
import type { ChatInfo } from "@/types";

type ChatListProps = {
	page: number;
}   
type UseChatListOptions = Omit<UseQueryOptions<ChatInfo[], Error>, 'queryKey' | 'queryFn'>;

export const useChatList = ({ page }: ChatListProps, options?: UseChatListOptions) => {
	return useQuery({
		queryKey: queryKeys.chat.list(page),
		queryFn: () => chatClient.getChatList(page),
		...options
	});
};
