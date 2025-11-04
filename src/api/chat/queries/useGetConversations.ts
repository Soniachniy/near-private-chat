import { useQuery } from "@tanstack/react-query";
import type { ConversationInfo } from "@/types";
import { chatClient } from "../client";

export const useGetConversations = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const conversations = await chatClient.getConversations();
      return conversations as unknown as ConversationInfo[];
    },
    enabled: !!token,
  });
};
