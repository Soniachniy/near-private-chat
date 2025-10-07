import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import type { Chat } from "@/types";
import { chatClient } from "../client";

type ChatSearchProps = {
  text: string;
  page: number;
};
type UseChatSearchOptions = Omit<UseQueryOptions<Chat[], Error>, "queryKey" | "queryFn">;

export const useChatSearch = ({ text, page }: ChatSearchProps, options?: UseChatSearchOptions) => {
  return useQuery({
    queryKey: queryKeys.chat.search(text, page),
    queryFn: () => chatClient.getChatListBySearchText(text, page),
    ...options,
  });
};
