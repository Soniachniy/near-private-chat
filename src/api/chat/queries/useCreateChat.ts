import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import { useChatStore } from "@/stores/useChatStore";
import type { Chat } from "@/types";
import { chatClient } from "../client";

type CreateNewChatParams = {
  chat: object;
};

type UseCreateNewChatOptions = Omit<UseMutationOptions<Chat, Error, CreateNewChatParams>, "mutationFn">;

export const useCreateNewChat = (options?: UseCreateNewChatOptions) => {
  //TODO: invalidate queries
  return useMutation({
    mutationFn: ({ chat }: CreateNewChatParams) => chatClient.createNewChat(chat),
    ...options,
  });
};

export const useCreateChat = () => {
  const { addChat } = useChatStore();

  return (title: string) => {
    const chat = chatClient.createChat(title);
    addChat(chat);
    return chat;
  };
};
