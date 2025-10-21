import { type QueryClient, useMutation } from "@tanstack/react-query";
import { chatClient } from "../client";

export const useResponse = () => {
  const sendPrompt = useMutation({
    mutationFn: async ({
      prompt,
      model,
      conversationId,
    }: {
      prompt: string;
      model: string;
      conversationId: string;
    }) => {
      return chatClient.sentPrompt(prompt, "user", model, conversationId);
    },
  });

  const generateChatTitle = useMutation({
    mutationFn: async ({ prompt, model }: { prompt: string; model: string }) => {
      return chatClient.generateChatTitle(prompt, model);
    },
  });

  const startStream = useMutation({
    mutationFn: async ({
      model,
      role,
      content,
      conversation,
      queryClient,
    }: {
      model: string;
      role: "user" | "assistant";
      content: string;
      conversation: string;
      queryClient: QueryClient;
    }) => {
      return chatClient.startStream(model, role, content, conversation, queryClient);
    },
  });

  return { sendPrompt, generateChatTitle, startStream };
};
