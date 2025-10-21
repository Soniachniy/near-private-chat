import { useQuery } from "@tanstack/react-query";
import type { ConversationInfo } from "@/types";
import { chatClient } from "../client";

export const useGetConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const conversations = await chatClient.getConversations();
      return conversations as unknown as ConversationInfo[];
    },
  });
};
