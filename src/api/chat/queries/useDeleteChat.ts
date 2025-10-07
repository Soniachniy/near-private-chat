import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { chatClient } from "../client";
import type { Chat } from "@/types";
import { useChatStore } from "@/stores/useChatStore";
import { queryKeys } from "@/api/query-keys";

type DeleteChatParams = {
	id: string;
}

type UseDeleteChatOptions = Omit<UseMutationOptions<Chat, Error, DeleteChatParams>, 'mutationFn'>;

export const useDeleteChat = (options?: UseDeleteChatOptions) => {
	const queryClient = useQueryClient();
	const { deleteChat } = useChatStore(); //TODO: remove this

	return useMutation({
		mutationFn: ({ id }: DeleteChatParams) => chatClient.deleteChatById(id),
		onSuccess: (_, { id }) => {
			deleteChat(id);
			queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
		},
		...options
	});
};
