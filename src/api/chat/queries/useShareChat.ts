import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { chatClient } from "../client";
import type { Chat } from "@/types";

type ShareChatParams = {
	id: string;
}

type UseShareChatOptions = Omit<UseMutationOptions<Chat, Error, ShareChatParams>, 'mutationFn'>;

export const useShareChat = (options?: UseShareChatOptions) => {
	return useMutation({
		mutationFn: ({ id }: ShareChatParams) => chatClient.shareChatById(id),
		...options
	});
};
