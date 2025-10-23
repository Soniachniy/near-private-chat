import { useMutation } from "@tanstack/react-query";
import type {
  ConversationCreateParams,
  ConversationUpdateParams,
} from "openai/resources/conversations/conversations.mjs";
import { chatClient } from "../client";

export const useConversation = () => {
  const createConversation = useMutation({
    mutationFn: (conversation: ConversationCreateParams) => chatClient.createConversation(conversation),
  });

  const updateConversation = useMutation({
    mutationFn: ({
      conversationId,
      metadata,
    }: {
      conversationId: string;
      metadata: ConversationUpdateParams["metadata"];
    }) => chatClient.updateConversation(conversationId, metadata),
  });

  return {
    createConversation,
    updateConversation,
  };
};
