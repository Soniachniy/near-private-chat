import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import type { Chat } from "@/types";
import { chatClient } from "../client";

type ChatShareIdProps = {
  shareId: string;
};
type UseChatByShareIdOptions = Omit<UseQueryOptions<Chat, Error>, "queryKey" | "queryFn">;

export const useChatByShareId = ({ shareId }: ChatShareIdProps, options?: UseChatByShareIdOptions) => {
  return useQuery({
    queryKey: queryKeys.chat.byShareId(shareId),
    queryFn: () => chatClient.getChatByShareId(shareId),
    ...options,
  });
};
