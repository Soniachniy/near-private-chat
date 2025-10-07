import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import type { Chat } from "@/types";
import { chatClient } from "../client";

type ImportChatParams = {
  chat: object;
  meta: object | null;
  pinned?: boolean;
  folderId?: string | null;
};

type UseImportChatOptions = Omit<UseMutationOptions<Chat, Error, ImportChatParams>, "mutationFn">;

export const useImportChat = (options?: UseImportChatOptions) => {
  return useMutation({
    mutationFn: ({ chat, meta, pinned, folderId }: ImportChatParams) =>
      chatClient.importChat(chat, meta, pinned, folderId),
    ...options,
  });
};
