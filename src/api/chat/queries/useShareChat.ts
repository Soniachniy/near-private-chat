import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import type { Chat } from "@/types";
import { chatClient } from "../client";

type ShareChatParams = {
  id: string;
};

type UseShareChatOptions = Omit<UseMutationOptions<Chat, Error, ShareChatParams>, "mutationFn">;

export const useShareChat = (options?: UseShareChatOptions) => {
  return useMutation({
    mutationFn: ({ id }: ShareChatParams) => chatClient.shareChatById(id),
    ...options,
  });
};
