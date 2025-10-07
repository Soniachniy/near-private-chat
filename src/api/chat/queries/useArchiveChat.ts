import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { chatClient } from "../client";
import type { Chat } from "@/types";
import { queryKeys } from "@/api/query-keys";

type ArchiveChatParams = {
	id: string;
}

type UseArchiveChatOptions = Omit<UseMutationOptions<Chat, Error, ArchiveChatParams>, 'mutationFn'>;

export const useArchiveChat = (options?: UseArchiveChatOptions) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id }: ArchiveChatParams) => chatClient.archiveChatById(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
		},
		...options
	});
};
