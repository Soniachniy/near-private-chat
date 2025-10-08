import { useMutation, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { chatClient } from "@/api/chat/client";
import { useChatById } from "@/api/chat/queries";
import { useChatWebSocket } from "@/api/chat/websocket/useChatWebSocket";
import { TEMP_API_BASE_URL } from "@/api/constants";
import { queryKeys } from "@/api/query-keys";
import ChatPlaceholder from "@/components/chat/ChatPlaceholder";
import MessageInput from "@/components/chat/MessageInput";
import MessageSkeleton from "@/components/chat/MessageSkeleton";
import MultiResponseMessages from "@/components/chat/messages/MultiResponseMessages";
import ResponseMessage from "@/components/chat/messages/ResponseMessage";
import UserMessage from "@/components/chat/messages/UserMessage";
import Navbar from "@/components/chat/Navbar";
import { useChatStore } from "@/stores/useChatStore";
import type { ChatHistory, FileItem, Message } from "@/types";

interface SendPromptParams {
  prompt: string;
  chatId?: string;
  model?: string;
  files?: FileItem[];
}

const Home: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const { selectedModels, addMessage, updateMessage, currentChat, models } = useChatStore();
  const messagesContainerElement = useRef<HTMLDivElement>(null);
  const { isLoading: isChatLoading, isFetching } = useChatById(
    { id: currentChatId || "", setCurrentMessages },
    { enabled: !!currentChatId }
  );
  const { socket } = useChatWebSocket(setCurrentMessages);

  const handleSendMessage = async (content: string, files: FileItem[]) => {
    if (!content || !selectedModels.length) return;
    sendPromptMutation(
      {
        prompt: content,
        chatId: currentChatId,
        files,
      },
      {
        onSuccess: (data) => {
          if (!currentChatId && data?.chatId) {
            navigate(`/c/${data.chatId}`);
          }
        },
      }
    );
  };

  const handleEditMessage = (messageId: string, content: string) => {
    console.log("Edit message:", messageId, content);
    updateMessage(messageId, { content });
  };

  const handleSaveMessage = (messageId: string, content: string) => {
    console.log("Save message:", messageId, content);
    updateMessage(messageId, { content });
  };

  const handleDeleteMessage = (messageId: string) => {
    console.log("Delete message:", messageId);
  };

  const handleRegenerateResponse = async (message: Message) => {
    console.log("Regenerate response", message);
  };

  const handleShowPreviousMessage = (message: Message) => {
    if (message.parentId !== null) {
      const messageId =
        currentChat?.chat.history.messages[message.parentId].childrenIds[
          Math.max(currentChat?.chat.history.messages[message.parentId].childrenIds.indexOf(message.id) - 1, 0)
        ];
      if (messageId) {
        setCurrentMessages((prevMessages: Message[]) => {
          const messageIndex = prevMessages.findIndex((m) => m.id === message.id);
          if (messageIndex !== -1 && currentChat?.chat.history.messages[messageId]) {
            prevMessages[messageIndex] = currentChat?.chat.history.messages[messageId];
          }
          return [...prevMessages];
        });
      }
    }
  };

  const handleShowNextMessage = (message: Message) => {
    if (!message.parentId) return;
    const messageId =
      currentChat?.chat.history.messages[message.parentId].childrenIds[
        Math.min(
          currentChat?.chat.history.messages[message.parentId].childrenIds.indexOf(message.id) + 1,
          currentChat?.chat.history.messages[message.parentId].childrenIds.length - 1
        )
      ];
    if (messageId) {
      setCurrentMessages((prevMessages: Message[]) => {
        const messageIndex = prevMessages.findIndex((m) => m.id === message.id);
        if (messageIndex !== -1 && currentChat?.chat.history.messages[messageId]) {
          prevMessages[messageIndex] = currentChat?.chat.history.messages[messageId];
        }
        return [...prevMessages];
      });
    }
  };

  const handleMergeResponses = () => {
    console.log("Merge responses");
  };

  const { mutate: sendPromptMutation } = useMutation({
    mutationFn: async ({ prompt, model, files }: SendPromptParams) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      if (!prompt && (!files || files.length === 0)) {
        throw new Error("Please enter a prompt");
      }

      const selectedModel = model || selectedModels[0];
      if (!selectedModel || selectedModel === "") {
        toast.error("Model not selected");
        return;
      }
      const filteredFiles = [...(currentChat?.chat.files ?? []), ...(files ?? [])].filter(
        (item, index, array) => array.findIndex((i) => JSON.stringify(i) === JSON.stringify(item)) === index
      );

      const userMessageId = uuidv4();
      const userMessage: Message = {
        id: userMessageId,
        parentId: currentChat?.chat.messages.length !== 0 ? (currentChat?.chat.messages.at(-1)?.id ?? null) : null,
        childrenIds: [],
        role: "user",
        content: prompt,
        timestamp: Math.floor(Date.now() / 1000),
        models: [selectedModel],
        modelName: "",
        done: true,
        files: files ?? [],
      };

      addMessage(userMessage);
      setCurrentMessages((prevMessages: Message[]) => [...prevMessages, userMessage]);

      const assistantMessageId = uuidv4();
      const modelInfo = models.find((m) => m.id === selectedModel);
      const assistantMessage: Message = {
        id: assistantMessageId,
        parentId: userMessageId,
        childrenIds: [],
        role: "assistant",
        content: "",
        timestamp: Math.floor(Date.now() / 1000),
        models: [selectedModel],
        modelName: modelInfo?.name || selectedModel,
        model: selectedModel,
        done: false,
      };

      addMessage(assistantMessage);
      setCurrentMessages((prevMessages: Message[]) => [...prevMessages, assistantMessage]);

      userMessage.childrenIds = [assistantMessageId];
      updateMessage(userMessageId, {
        childrenIds: [assistantMessageId],
      });
      setCurrentMessages((prevMessages: Message[]) => {
        const message = prevMessages.find((message) => message.id === userMessageId);
        if (message) {
          message.childrenIds = [assistantMessageId];
        }
        return prevMessages;
      });
      let localChatId = currentChatId;

      if (!localChatId) {
        const newChatHistory: ChatHistory = {
          messages: {
            [userMessageId]: userMessage,
            [assistantMessageId]: assistantMessage,
          },
          currentId: assistantMessageId,
        };
        const newChat = await chatClient.createNewChat({
          id: uuidv4(),
          title: prompt.slice(0, 50),
          models: [selectedModel],
          history: newChatHistory,
          messages: [userMessage, assistantMessage],
          timestamp: Date.now(),
        });

        queryClient.invalidateQueries({ queryKey: ["chats"] });
        setCurrentChatId(newChat.id);
        localChatId = newChat.id;
      }

      const updatedChat = await chatClient.updateChatById(localChatId!, {
        messages: [...currentMessages, userMessage, assistantMessage],
        history: {
          ...currentChat?.chat.history,
          messages: {
            ...currentChat?.chat.history.messages,
            [userMessageId]: userMessage,
            [assistantMessageId]: assistantMessage,
          },
          currentId: assistantMessageId,
        },
        models: selectedModels,
        params: currentChat?.chat.params,
        files: filteredFiles,
      });
      console.log("updatedChat", updatedChat);

      const allMessages = [...currentMessages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
        ...(msg.files ? { files: msg.files } : {}),
      }));

      const modelItem = models.find((m) => m.id === selectedModel);

      const isFirstMessage = allMessages.length === 1;

      const response = await fetch(`${TEMP_API_BASE_URL}/api/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: allMessages,
          stream: true,
          params: {}, // Model-specific parameters
          files: filteredFiles, // Files attached to the chat
          tool_ids: [], // Selected tool IDs
          tool_servers: [], // Tool servers configuration
          features: {
            image_generation: false,
            code_interpreter: false,
            web_search: false,
          },
          variables: {},
          model_item: modelItem || {},
          session_id: socket?.id || undefined,
          chat_id: localChatId,
          id: assistantMessageId,
          ...(isFirstMessage
            ? {
                background_tasks: {
                  title_generation: true,
                  tags_generation: true,
                },
              }
            : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to send message");
      }

      messagesContainerElement.current?.scrollIntoView({ behavior: "smooth" });

      return {
        chatId: currentChatId,
        userMessageId,
        assistantMessageId,
      };
    },
    onSuccess: () => {},
    onError: (error) => {
      console.error("Failed to send message:", error);
    },
  });

  useEffect(() => {
    setCurrentChatId(chatId);
    queryClient.invalidateQueries({ queryKey: queryKeys.chat.byId(chatId!) });
    const element = document.getElementById("messages-container");
    element?.scrollIntoView({ behavior: "smooth" });
  }, [chatId]);

  if (isChatLoading || isFetching) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <div className="text-gray-500 text-sm dark:text-gray-400">Loading chat...</div>
        </div>
      </div>
    );
  }

  if (!currentChatId) {
    return (
      <>
        <Navbar />
        <ChatPlaceholder
          submitVoice={async (voice) => {
            await handleSendMessage(voice, []);
          }}
          submitPrompt={async (prompt) => {
            await handleSendMessage(prompt, []);
          }}
        />
      </>
    );
  }
  console.log("currentMessages", currentMessages);
  return (
    <div className="flex h-full flex-col bg-gray-900">
      <Navbar />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pt-8">
        {currentMessages.map((message, idx) => {
          const siblings =
            currentChat?.chat.history.messages?.[message.parentId ?? ""]?.childrenIds ??
            Object.values(currentChat?.chat.history.messages ?? {})
              .filter((msg) => msg.parentId === null)
              .map((msg) => msg.id);

          if (message.role === "user") {
            return (
              <UserMessage
                key={message.id}
                history={currentChat?.chat.history || { messages: {}, currentId: null }}
                messageId={message.id}
                siblings={siblings}
                isFirstMessage={idx === 0}
                readOnly={false}
                editMessage={handleEditMessage}
                deleteMessage={handleDeleteMessage}
              />
            );
          } else if (message.content === "" && !message.error) {
            return <MessageSkeleton key={message.id} />;
          } else {
            const hasMultipleModels =
              message.parentId && (currentChat?.chat.history.messages[message.parentId]?.models.length ?? 1) > 1;

            if (hasMultipleModels) {
              return (
                <MultiResponseMessages
                  key={message.id}
                  history={
                    currentChat?.chat.history || {
                      messages: {},
                      currentId: null,
                    }
                  }
                  messageId={message.id}
                  isLastMessage={idx === currentMessages.length - 1}
                  readOnly={false}
                  webSearchEnabled={false}
                  saveMessage={handleSaveMessage}
                  deleteMessage={handleDeleteMessage}
                  regenerateResponse={handleRegenerateResponse}
                  mergeResponses={handleMergeResponses}
                  showPreviousMessage={handleShowPreviousMessage}
                  showNextMessage={handleShowNextMessage}
                />
              );
            } else {
              return (
                <ResponseMessage
                  key={message.id}
                  history={
                    currentChat?.chat.history || {
                      messages: {},
                      currentId: null,
                    }
                  }
                  messageId={message.id}
                  siblings={siblings}
                  isLastMessage={idx === currentMessages.length - 1}
                  readOnly={false}
                  webSearchEnabled={false}
                  saveMessage={handleSaveMessage}
                  deleteMessage={handleDeleteMessage}
                  regenerateResponse={handleRegenerateResponse}
                  showPreviousMessage={handleShowPreviousMessage}
                  showNextMessage={handleShowNextMessage}
                />
              );
            }
          }
        })}
        <div ref={messagesContainerElement} id="messages-container" />
      </div>

      <MessageInput messages={currentChat?.chat.messages} onSubmit={handleSendMessage} />
    </div>
  );
};

export default Home;
