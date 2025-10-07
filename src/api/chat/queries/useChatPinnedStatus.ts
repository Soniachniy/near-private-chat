import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import { chatClient } from "../client";

type ChatPinnedStatusProps = {
  id: string;
};
type UseChatPinnedStatusOptions = Omit<UseQueryOptions<boolean, Error>, "queryKey" | "queryFn">;

export const useChatPinnedStatus = ({ id }: ChatPinnedStatusProps, options?: UseChatPinnedStatusOptions) => {
  return useQuery({
    queryKey: queryKeys.chat.pinnedStatus(id),
    queryFn: () => chatClient.getChatPinnedStatusById(id),
    ...options,
  });
};
