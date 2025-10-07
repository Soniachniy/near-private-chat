import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import type { Chat } from "@/types";
import { chatClient } from "../client";

type UseArchivedChatsOptions = Omit<UseQueryOptions<Chat[], Error>, "queryKey" | "queryFn">;

export const useArchivedChats = (options?: UseArchivedChatsOptions) => {
  return useQuery({
    queryKey: queryKeys.chat.archived,
    queryFn: () => chatClient.getArchivedChatList(),
    ...options,
  });
};
