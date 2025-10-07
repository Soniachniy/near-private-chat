import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { chatClient } from "../client";
import type { Chat } from "@/types";
import { useChatStore } from "@/stores/useChatStore";

type CreateNewChatParams = {
	chat: object;
}

type UseCreateNewChatOptions = Omit<UseMutationOptions<Chat, Error, CreateNewChatParams>, 'mutationFn'>;

export const useCreateNewChat = (options?: UseCreateNewChatOptions) => {
	//TODO: invalidate queries
	return useMutation({
		mutationFn: ({ chat }: CreateNewChatParams) => chatClient.createNewChat(chat),
		...options
	});
};

export const useCreateChat = () => {
	const { addChat } = useChatStore();

	return (title: string) => {
		const chat = chatClient.createChat(title);
		addChat(chat);
		return chat;
	};
};