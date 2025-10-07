import { type UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { useChatStore } from "@/stores/useChatStore";
import type { Chat } from "@/types";
import { chatClient } from "../client";

type RenameChatParams = {
  id: string;
  title: string;
};

type UseRenameChatOptions = Omit<UseMutationOptions<Chat, Error, RenameChatParams>, "mutationFn">;

export const useRenameChat = (options?: UseRenameChatOptions) => {
  const queryClient = useQueryClient();
  const { updateChat } = useChatStore();

  return useMutation({
    mutationFn: async ({ id, title }: RenameChatParams) => {
      updateChat(id, { title });
      return chatClient.updateChatById(id, { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
    },
    ...options,
  });
};
