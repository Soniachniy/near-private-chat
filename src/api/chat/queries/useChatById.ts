import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { chatClient } from "../client";
import { queryKeys } from "@/api/query-keys";
import type { Chat, Message } from "@/types";
import { useChatStore } from "@/stores/useChatStore";

type ChatIdProps = {
	id: string;
	setCurrentMessages: (messages: Message[]) => void
}

type UseChatByIdOptions = Omit<UseQueryOptions<Chat, Error>, 'queryKey' | 'queryFn'>;

export const useChatById = ({ id, setCurrentMessages }: ChatIdProps, options?: UseChatByIdOptions) => {
	const { setCurrentChat } = useChatStore();
	
	return useQuery({
		queryKey: queryKeys.chat.byId(id),
		queryFn: async () => {
			const chat = await chatClient.getChatById(id);
			console.log(chat);
			setCurrentChat(chat);
			setCurrentMessages(Object.values(chat.chat.history.messages));
			return chat;
		},
		enabled: !!id,
		...options
	});
};
