import { type UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import type { Chat } from "@/types";
import { chatClient } from "../client";

type TogglePinnedStatusParams = {
  id: string;
};

type UseTogglePinnedStatusOptions = Omit<UseMutationOptions<Chat, Error, TogglePinnedStatusParams>, "mutationFn">;

export const useTogglePinnedStatus = (options?: UseTogglePinnedStatusOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: TogglePinnedStatusParams) => chatClient.toggleChatPinnedStatusById(id),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.pinnedStatus(id) });
    },
    ...options,
  });
};
