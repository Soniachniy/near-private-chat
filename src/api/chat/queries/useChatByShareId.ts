import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { chatClient } from "../client";
import { queryKeys } from "@/api/query-keys";
import type { Chat } from "@/types";

type ChatShareIdProps = {
	shareId: string;
}
type UseChatByShareIdOptions = Omit<UseQueryOptions<Chat, Error>, 'queryKey' | 'queryFn'>;

export const useChatByShareId = ({ shareId }: ChatShareIdProps, options?: UseChatByShareIdOptions) => {
	
	return useQuery({
		queryKey: queryKeys.chat.byShareId(shareId),
		queryFn: () => chatClient.getChatByShareId(shareId),
		...options
	});
};
