import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { useChatStore } from "@/stores/useChatStore";
import type { Chat, Message } from "@/types";
import { chatClient } from "../client";

type ChatIdProps = {
  id: string;
  setCurrentMessages: (messages: Message[]) => void;
};

type UseChatByIdOptions = Omit<UseQueryOptions<Chat, Error>, "queryKey" | "queryFn">;

export const useChatById = ({ id, setCurrentMessages }: ChatIdProps, options?: UseChatByIdOptions) => {
  const { setCurrentChat } = useChatStore();

  return useQuery({
    queryKey: queryKeys.chat.byId(id),
    queryFn: async () => {
      const chat = await chatClient.getChatById(id);
      console.log(chat);
      setCurrentChat(chat);
      setCurrentMessages(Object.values(chat.chat.history.messages));
      return chat;
    },
    enabled: !!id,
    ...options,
  });
};
