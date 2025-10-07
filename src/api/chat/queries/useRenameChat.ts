import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { chatClient } from "../client";
import type { Chat } from "@/types";
import { useChatStore } from "@/stores/useChatStore";
import { queryKeys } from "@/api/query-keys";

type RenameChatParams = {
	id: string;
	title: string;
}

type UseRenameChatOptions = Omit<UseMutationOptions<Chat, Error, RenameChatParams>, 'mutationFn'>;

export const useRenameChat = (options?: UseRenameChatOptions) => {
	const queryClient = useQueryClient();
	const { updateChat } = useChatStore();

	return useMutation({
		mutationFn: async ({ id, title }: RenameChatParams) => {
			updateChat(id, { title });
			return chatClient.updateChatById(id, { title })
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
		},
		...options
	});
};
