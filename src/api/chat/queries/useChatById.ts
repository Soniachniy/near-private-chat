import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { useChatStore } from "@/stores/useChatStore";
import type { Chat, ChatHistory, Message } from "@/types";
import { chatClient } from "../client";

type ChatIdProps = {
  id: string;
  setCurrentMessages: (messages: Message[]) => void;
};

type UseChatByIdOptions = Omit<UseQueryOptions<Chat, Error>, "queryKey" | "queryFn">;

export const createMessagesList = (history: ChatHistory, messageId: string): Message[] => {
  if (messageId === null) {
    return [];
  }

  const message = history.messages[messageId];
  if (message?.parentId) {
    return [...createMessagesList(history, message.parentId), message];
  } else {
    return [message];
  }
};

export const useChatById = ({ id, setCurrentMessages }: ChatIdProps, options?: UseChatByIdOptions) => {
  const { setCurrentChat, setSelectedModels } = useChatStore();

  return useQuery({
    queryKey: queryKeys.chat.byId(id),
    queryFn: async () => {
      const chat = await chatClient.getChatById(id);
      setCurrentChat(chat);
      setCurrentMessages(createMessagesList(chat.chat.history, chat.chat.history.currentId));
      setSelectedModels(chat.chat.models);
      return chat;
    },
    enabled: !!id,
    ...options,
  });
};
