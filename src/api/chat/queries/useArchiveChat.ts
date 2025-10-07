import { type UseMutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import type { Chat } from "@/types";
import { chatClient } from "../client";

type ArchiveChatParams = {
  id: string;
};

type UseArchiveChatOptions = Omit<UseMutationOptions<Chat, Error, ArchiveChatParams>, "mutationFn">;

export const useArchiveChat = (options?: UseArchiveChatOptions) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: ArchiveChatParams) => chatClient.archiveChatById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
    },
    ...options,
  });
};
