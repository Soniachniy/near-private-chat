import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { chatClient } from "../client";
import { queryKeys } from "@/api/query-keys";

type ChatPinnedStatusProps = {
	id: string;
}
type UseChatPinnedStatusOptions = Omit<UseQueryOptions<boolean, Error>, 'queryKey' | 'queryFn'>;

export const useChatPinnedStatus = ({ id }: ChatPinnedStatusProps, options?: UseChatPinnedStatusOptions) => {
	
	return useQuery({
		queryKey: queryKeys.chat.pinnedStatus(id),
		queryFn: () => chatClient.getChatPinnedStatusById(id),
		...options
	});
};
