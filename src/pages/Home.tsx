import { useQueryClient } from "@tanstack/react-query";
import type { Message as MessageOpenAI } from "openai/resources/conversations/conversations";
import type React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useConversation } from "@/api/chat/queries/useConversation";
import { useGetConversation } from "@/api/chat/queries/useGetConversation";
import { useResponse } from "@/api/chat/queries/useResponse";
// import { toast } from "sonner";
// import { v4 as uuidv4 } from "uuid";
// import { chatClient } from "@/api/chat/client";
// import {
//   useChatById,
//   useCreateChat,
//   useCreateNewChat,
// } from "@/api/chat/queries";
// import { useChatWebSocket } from "@/api/chat/websocket/useChatWebSocket";
// import { TEMP_API_BASE_URL } from "@/api/constants";
import ChatPlaceholder from "@/components/chat/ChatPlaceholder";
import MessageInput from "@/components/chat/MessageInput";
import MessageSkeleton from "@/components/chat/MessageSkeleton";
import ResponseMessage from "@/components/chat/messages/ResponseMessage";
import UserMessage from "@/components/chat/messages/UserMessage";
import Navbar from "@/components/chat/Navbar";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types";
import { type FileContentItem, generateContentFileDataForOpenAI } from "@/types/openai";

// interface SendPromptParams {
//   prompt: string;
//   chatId?: string;
//   model?: string;
//   files?: FileItem[];
// }

const Home: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [opacity, setOpacity] = useState<number>(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { updateMessage, currentChat } = useChatStore();

  const { createConversation, updateConversation } = useConversation();

  const {
    isLoading: isConversationsLoading,
    isFetching: isConversationsFetching,
    data: conversationData,
  } = useGetConversation(chatId!);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { generateChatTitle, startStream } = useResponse();

  const handleSendMessage = async (content: string, files: FileContentItem[]) => {
    const contentItems = [
      { type: "input_text", text: content },
      ...files.map((file) => generateContentFileDataForOpenAI(file)),
    ];
    console.log("handleSendMessage", content, files, contentItems);

    if (!chatId) {
      const newConversation = await createConversation.mutateAsync(
        {
          items: [],
          metadata: {
            title: "Basic Conversation",
          },
        },
        {
          onSuccess: async (data) => {
            await navigate(`/c/${data.id}`);
            queryClient.setQueryData(["conversation", data.id], (old: Conversation) => {
              return {
                ...old,
                id: data.id,
                created_at: data.created_at,
                metadata: data.metadata,
                object: data.object,
                data: [
                  {
                    id: "empty", // TODO: update user prompt id  asap
                    role: "user",
                    type: "message",
                    content: contentItems,
                  },
                ],
              };
            });
            await startStream.mutateAsync({
              model: "gpt-5-nano",
              conversation: data.id,
              role: "user",
              content: contentItems,
              queryClient: queryClient,
            });

            await generateChatTitle.mutateAsync(
              {
                prompt: content,
                model: "gpt-5-nano",
              },
              {
                onSuccess: async (data) => {
                  const responseItem = data.output.find((item) => item.type === "message");
                  const messageContent = responseItem?.content.find((item) => item.type === "output_text")?.text;
                  await updateConversation.mutateAsync({
                    conversationId: newConversation.id,
                    metadata: {
                      title: messageContent || "",
                    },
                  });
                },
              }
            );
          },
        }
      );
    } else {
      queryClient.setQueryData(["conversation", chatId], (old: Conversation) => {
        return {
          ...old,
          data: [
            {
              id: "empty",
              role: "user",
              type: "message",
              content: contentItems,
            },
            ...(old.data ?? []),
          ],
        };
      });
      await startStream.mutateAsync({
        model: "gpt-5-nano",
        conversation: chatId,
        role: "user",
        content: contentItems,
        queryClient: queryClient,
      });
    }
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

  const handleRegenerateResponse = async (message: MessageOpenAI) => {
    console.log("Regenerate response", message);
  };

  const handleShowPreviousMessage = (message: MessageOpenAI) => {
    console.log("Show previous message", message);
    // if (message.parentId !== null) {
    //   const messageId =
    //     currentChat?.chat.history.messages[message.parentId].childrenIds[
    //       Math.max(
    //         currentChat?.chat.history.messages[
    //           message.parentId
    //         ].childrenIds.indexOf(message.id) - 1,
    //         0
    //       )
    //     ];
    //   if (messageId) {
    //     setCurrentMessages((prevMessages: Message[]) => {
    //       const messageIndex = prevMessages.findIndex(
    //         (m) => m.id === message.id
    //       );
    //       if (
    //         messageIndex !== -1 &&
    //         currentChat?.chat.history.messages[messageId]
    //       ) {
    //         prevMessages[messageIndex] =
    //           currentChat?.chat.history.messages[messageId];
    //       }
    //       return [...prevMessages];
    //     });
    //   }
    // }
  };

  const handleShowNextMessage = (message: MessageOpenAI) => {
    console.log("Show next message", message);
    // if (!message.parentId) return;
    // const messageId =
    //   currentChat?.chat.history.messages[message.parentId].childrenIds[
    //     Math.min(
    //       currentChat?.chat.history.messages[
    //         message.parentId
    //       ].childrenIds.indexOf(message.id) + 1,
    //       currentChat?.chat.history.messages[message.parentId].childrenIds
    //         .length - 1
    //     )
    //   ];
    // if (messageId) {
    //   setCurrentMessages((prevMessages: Message[]) => {
    //     const messageIndex = prevMessages.findIndex((m) => m.id === message.id);
    //     if (
    //       messageIndex !== -1 &&
    //       currentChat?.chat.history.messages[messageId]
    //     ) {
    //       prevMessages[messageIndex] =
    //         currentChat?.chat.history.messages[messageId];
    //     }
    //     return [...prevMessages];
    //   });
    // }
  };

  // Reset opacity when chatId changes
  useEffect(() => {
    setOpacity(0);
  }, [chatId]);

  useLayoutEffect(() => {
    if (!conversationData || !scrollContainerRef.current) return;

    const frameId = requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
        setOpacity(1);
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, [chatId, conversationData]);

  if (isConversationsLoading || isConversationsFetching) {
    return <LoadingScreen />;
  }

  if (!chatId) {
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
  const currentMessages = [...(conversationData?.data ?? [])].reverse();

  return (
    <div className="flex h-full flex-col bg-gray-900">
      <Navbar />
      <div
        ref={scrollContainerRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pt-8 transition-opacity delay-200 duration-500"
        style={{ opacity }}
      >
        {currentMessages.map((message, idx) => {
          // const siblings: string[] = [];
          console.log("Rendering message", message);

          if (message.type !== "message") {
            return null;
          }

          if (message.type === "message" && message.role === "user") {
            console.log("user message", message);
            return (
              <UserMessage
                message={message}
                isFirstMessage={idx === 0}
                readOnly={false}
                editMessage={handleEditMessage}
                deleteMessage={handleDeleteMessage}
              />
            );
          } else if (message.content.join("") === "") {
            // } else if (message.content.join("") === "" && !message.error) {
            return <MessageSkeleton key={message.id} />;
          } else {
            // const hasMultipleModels = false;

            // if (hasMultipleModels) {
            //   return (
            //     <MultiResponseMessages
            //       message={message}
            //       isLastMessage={idx === currentMessages.length - 1}
            //       readOnly={false}
            //       webSearchEnabled={false}
            //       saveMessage={handleSaveMessage}
            //       deleteMessage={handleDeleteMessage}
            //       regenerateResponse={handleRegenerateResponse}
            //       mergeResponses={handleMergeResponses}
            //       showPreviousMessage={handleShowPreviousMessage}
            //       showNextMessage={handleShowNextMessage}
            //     />
            //   );
            // } else {
            return (
              <ResponseMessage
                message={message}
                siblings={[]}
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
            // }
          }
        })}
      </div>

      <MessageInput messages={currentChat?.chat.messages} onSubmit={handleSendMessage} />
    </div>
  );
};

export default Home;
