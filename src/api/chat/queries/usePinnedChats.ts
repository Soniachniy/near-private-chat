import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import type { Chat } from "@/types";
import { chatClient } from "../client";

type UsePinnedChatsOptions = Omit<UseQueryOptions<Chat[], Error>, "queryKey" | "queryFn">;

export const usePinnedChats = (options?: UsePinnedChatsOptions) => {
  return useQuery({
    queryKey: queryKeys.chat.pinned,
    queryFn: () => chatClient.getPinnedChatList(),
    ...options,
  });
};
