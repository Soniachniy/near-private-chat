import { type UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { useChatStore } from "@/stores/useChatStore";
import type { Chat } from "@/types";
import { chatClient } from "../client";

type DeleteChatParams = {
  id: string;
};

type UseDeleteChatOptions = Omit<UseMutationOptions<Chat, Error, DeleteChatParams>, "mutationFn">;

export const useDeleteChat = (options?: UseDeleteChatOptions) => {
  const queryClient = useQueryClient();
  const { deleteChat } = useChatStore(); //TODO: remove this

  return useMutation({
    mutationFn: ({ id }: DeleteChatParams) => chatClient.deleteChatById(id),
    onSuccess: (_, { id }) => {
      deleteChat(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
    },
    ...options,
  });
};
