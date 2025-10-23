import { useQuery } from "@tanstack/react-query";
import type { Conversation } from "@/types";
import { chatClient } from "../client";

export const useGetConversation = (id: string) => {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      const [conversation, conversationItems] = await Promise.all([
        chatClient.getConversation(id),
        chatClient.getConversationItems(id),
      ]);

      console.log("conversationItems", conversationItems);
      const mergedConversation: Conversation = {
        id: conversation.id,
        created_at: conversation.created_at,
        metadata: conversation.metadata,
        object: conversation.object,
        data: conversationItems.data,
        has_more: conversationItems.has_more,
        last_id: conversationItems.last_id,

        // // Chat properties
        // user_id: chat.user_id,
        // title: chat.title,
        // chat: chat.chat,
      };
      console.log("mergedConversation", mergedConversation);

      return mergedConversation;
    },
    enabled: !!id,
  });
};
