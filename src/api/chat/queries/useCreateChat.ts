import { useMutation } from "@tanstack/react-query";
import { useChatStore } from "@/stores/useChatStore";
import { chatClient } from "../client";

export const useCreateNewChat = () => {
  return useMutation({
    mutationFn: (prompt: string) => chatClient.createNewChat(prompt, "user"),
  });
};

export const useCreateChat = () => {
  const { addChat } = useChatStore();

  return (title: string) => {
    const chat = chatClient.createChat(title);
    addChat(chat);
    return chat;
  };
};
