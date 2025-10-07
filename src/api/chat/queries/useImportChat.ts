import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { chatClient } from "../client";
import type { Chat } from "@/types";

type ImportChatParams = {
	chat: object;
	meta: object | null;
	pinned?: boolean;
	folderId?: string | null;
}

type UseImportChatOptions = Omit<UseMutationOptions<Chat, Error, ImportChatParams>, 'mutationFn'>;

export const useImportChat = (options?: UseImportChatOptions) => {
	return useMutation({
		mutationFn: ({ chat, meta, pinned, folderId }: ImportChatParams) => 
			chatClient.importChat(chat, meta, pinned, folderId),
		...options
	});
};
