import { useUserStore } from "@/stores/useUserStore";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { chatClient } from "../client";
import { useChatStore } from "@/stores/useChatStore";
import { queryKeys } from "@/api/query-keys";
import type { ChatInfo } from "@/types";

type UseChatsOptions = Omit<UseQueryOptions<ChatInfo[], Error>, 'queryKey' | 'queryFn'>;


export const useChats = (options?: UseChatsOptions) => {
	const { setChats } = useChatStore();
	const { user } = useUserStore();

	return useQuery({
		queryKey: queryKeys.chat.all,
		queryFn: async () => {
			const chats = await chatClient.getAllChats(); // TODO: add pagination
			setChats(chats);
			return chats;
		},
		enabled: !!user,
		...options
	});
};