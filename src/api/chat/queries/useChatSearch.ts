import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { chatClient } from "../client";
import { queryKeys } from "@/api/query-keys";
import type { Chat } from "@/types";

type ChatSearchProps = {
	text: string;
	page: number;
}   
type UseChatSearchOptions = Omit<UseQueryOptions<Chat[], Error>, 'queryKey' | 'queryFn'>;

export const useChatSearch = ({ text, page }: ChatSearchProps, options?: UseChatSearchOptions) => {
	return useQuery({
		queryKey: queryKeys.chat.search(text, page),
		queryFn: () => chatClient.getChatListBySearchText(text, page),
		...options
	});
};
