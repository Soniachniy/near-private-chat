import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { chatClient } from "../client";
import type { Chat } from "@/types";
import { queryKeys } from "@/api/query-keys";

type TogglePinnedStatusParams = {
	id: string;
}

type UseTogglePinnedStatusOptions = Omit<UseMutationOptions<Chat, Error, TogglePinnedStatusParams>, 'mutationFn'>;

export const useTogglePinnedStatus = (options?: UseTogglePinnedStatusOptions) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: TogglePinnedStatusParams) => chatClient.toggleChatPinnedStatusById(id),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.chat.pinnedStatus(id) });
		},
		...options
	});
};
