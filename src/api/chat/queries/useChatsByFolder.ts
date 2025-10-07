import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import type { Chat } from "@/types";
import { chatClient } from "../client";

type ChatsByFolderProps = {
  folderId: string;
};

type UseChatsByFolderOptions = Omit<UseQueryOptions<Chat[], Error>, "queryKey" | "queryFn">;

export const useChatsByFolder = ({ folderId }: ChatsByFolderProps, options?: UseChatsByFolderOptions) => {
  return useQuery({
    queryKey: queryKeys.chat.byFolderId(folderId),
    queryFn: () => chatClient.getChatsByFolderId(folderId),
    ...options,
  });
};
