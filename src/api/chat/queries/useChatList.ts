import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import type { ChatInfo } from "@/types";
import { chatClient } from "../client";

type ChatListProps = {
  page: number;
};
type UseChatListOptions = Omit<UseQueryOptions<ChatInfo[], Error>, "queryKey" | "queryFn">;

export const useChatList = ({ page }: ChatListProps, options?: UseChatListOptions) => {
  return useQuery({
    queryKey: queryKeys.chat.list(page),
    queryFn: () => chatClient.getChatList(page),
    ...options,
  });
};
