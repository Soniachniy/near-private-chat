import { type UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import type { Chat } from "@/types";
import { chatClient } from "../client";

type CloneChatParams = {
  id: string;
  title?: string;
};

type UseCloneChatOptions = Omit<UseMutationOptions<Chat, Error, CloneChatParams>, "mutationFn">;

export const useCloneChat = (options?: UseCloneChatOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: CloneChatParams) => chatClient.cloneChatById(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
    },
    ...options,
  });
};
