import type {
  ConversationCreateParams,
  ConversationUpdateParams,
  Conversation as OpenAIConversation,
} from "openai/resources/conversations/conversations.mjs";
import type { Responses } from "openai/resources/responses/responses.mjs";
import { ApiClient } from "@/api/base-client";
import { getTimeRange } from "@/lib/time";
import type { Chat, ChatInfo, Conversation, ConversationItemsResponse, StartStreamProps, Tag } from "@/types";
import type { FileOpenAIResponse, FilesOpenaiResponse } from "@/types/openai";

class ChatClient extends ApiClient {
  constructor() {
    super({
      apiPrefix: "/api/v1",
      defaultHeaders: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      includeAuth: true,
    });
  }

  //TODO: or use createNewChat
  createChat(title: string = "New Chat"): ChatInfo {
    return {
      id: `chat-${Date.now()}`,
      title,
      content: "",
      created_at: Date.now(),
      updated_at: Date.now().toString(),
    };
  }

  sentPrompt(prompt: string, role: "user" | "assistant" = "user", model: string = "gpt-5-nano", conversation: string) {
    return this.post<Responses.Response>(
      "/responses",
      {
        model: model,
        input: [{ role, content: prompt }],
        conversation,
      },
      {
        apiVersion: "v2",
      }
    );
  }

  generateChatTitle(prompt: string, model: string = "gpt-5-nano") {
    return this.post<Responses.Response>(
      "/responses",
      {
        model: model,
        input: [
          {
            role: "user",
            content: `Generate a title for the following conversation: ${prompt}, it should be short and concise, return only the title, nothing else.`,
          },
        ],
      },
      {
        apiVersion: "v2",
      }
    );
  }

  createConversation(conversation: ConversationCreateParams) {
    return this.post<OpenAIConversation>("/conversations", conversation, {
      apiVersion: "v2",
    });
  }

  // unnecessary since we add conversation id to the response request
  // addItemsToConversation(
  //   conversationId: string,
  //   items: Responses.ResponseInputItem[]
  // ) {
  //   console.log("addItemsToConversation", conversationId, items);
  //   return this.post<Responses.ResponseInputItem[]>(
  //     `/conversations/${conversationId}/items`,
  //     { items },
  //     {
  //       apiVersion: "v2",
  //     }
  //   );
  // }

  getConversation(id: string) {
    return this.get<Conversation>(`/conversations/${id}`, {
      apiVersion: "v2",
    });
  }

  updateConversation(conversationId: string, metadata: ConversationUpdateParams["metadata"]) {
    return this.post<ConversationUpdateParams>(
      `/conversations/${conversationId}`,
      {
        metadata: metadata,
      },
      {
        apiVersion: "v2",
      }
    );
  }
  getConversationsIds() {
    const conversations = localStorage.getItem("conversations");
    if (conversations) {
      return JSON.parse(conversations);
    }
    return [];
  }

  getConversationItems(id: string) {
    return this.get<ConversationItemsResponse>(`/conversations/${id}/items`, {
      apiVersion: "v2",
    });
  }

  async importChat(chat: object, meta: object | null, pinned?: boolean, folderId?: string | null) {
    return this.post<Chat>("/chats/import", {
      chat: chat,
      meta: meta ?? {},
      pinned: pinned,
      folder_id: folderId,
    });
  }

  async getConversations() {
    return this.get<Conversation[]>(`/conversations`, {
      apiVersion: "v2",
    });
  }

  async getChatList(page: number | null = null) {
    const searchParams = new URLSearchParams();
    if (page !== null) {
      searchParams.append("page", `${page}`);
    }
    const res = await this.get<Conversation[]>(`/conversations`, {
      apiVersion: "v2",
    });

    return res;
  }

  //TODO: Is it necessary?
  async getChatListByUserId(userId: string) {
    const res = await this.get<Chat[]>(`/chats/list/user/${userId}`);

    return res.map((chat) => ({
      ...chat,
      time_range: getTimeRange(chat.updated_at),
    }));
  }

  async getArchivedChatList() {
    return this.get<Chat[]>(`/chats/archived`);
  }

  async getAllChats() {
    return this.get<Chat[]>(`/chats/all`);
  }

  async getChatListBySearchText(text: string, page: number = 1) {
    const searchParams = new URLSearchParams();
    searchParams.append("text", text);
    searchParams.append("page", `${page}`);

    const res = await this.get<Chat[]>(`/chats/search?${searchParams.toString()}`);

    return res.map((chat) => ({
      ...chat,
      time_range: getTimeRange(chat.updated_at),
    }));
  }

  async getChatsByFolderId(folderId: string) {
    return this.get<Chat[]>(`/chats/folder/${folderId}`);
  }

  async getAllArchivedChats() {
    return this.get<Chat[]>(`/chats/all/archived`);
  }

  async getAllUserChats() {
    return this.get<Chat[]>(`/chats/all/db`);
  }

  async getAllTags() {
    return [];
  }

  async getPinnedChatList() {
    const res = await this.get<Chat[]>(`/chats/pinned`);
    return res.map((chat) => ({
      ...chat,
      time_range: getTimeRange(chat.updated_at),
    }));
  }

  async getChatListByTagName(tagName: string) {
    const res = await this.post<Chat[]>(`/chats/tags`, {
      name: tagName,
    });

    return res.map((chat) => ({
      ...chat,
      time_range: getTimeRange(chat.updated_at),
    }));
  }

  async getChatById(id: string) {
    return this.get<Chat>(`/chats/${id}`);
  }

  async getChatByShareId(shareId: string) {
    return this.get<Chat>(`/chats/share/${shareId}`);
  }

  async getChatPinnedStatusById(id: string) {
    return this.get<boolean>(`/chats/${id}/pinned`);
  }

  async toggleChatPinnedStatusById(id: string) {
    return this.post<Chat>(`/chats/${id}/pin`);
  }

  async cloneChatById(id: string, title?: string) {
    return this.post<Chat>(`/chats/${id}/clone`, {
      ...(title && { title: title }),
    });
  }

  async cloneSharedChatById(id: string) {
    return this.post<Chat>(`/chats/${id}/clone/shared`);
  }

  async shareChatById(id: string) {
    return this.post<Chat>(`/chats/${id}/share`);
  }

  async updateChatFolderIdById(id: string, folderId?: string) {
    return this.post<Chat>(`/chats/${id}/folder`, {
      folder_id: folderId,
    });
  }

  async archiveChatById(id: string) {
    return this.post<Chat>(`/chats/${id}/archive`);
  }

  async deleteSharedChatById(id: string) {
    return this.delete<Chat>(`/chats/${id}/share`);
  }

  async updateChatById(id: string, chat: object) {
    return this.post<Chat>(`/chats/${id}`, {
      chat: chat,
    });
  }

  async deleteChatById(id: string) {
    return this.delete<Chat>(`/chats/${id}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getTagsById(id: string): Promise<Tag[]> {
    console.log("getTagsById", id);
    return [];
    // return this.get<Tag[]>(`/chats/${id}/tags`);
  }

  async addTagById(id: string, tagName: string) {
    return this.post<Tag>(`/chats/${id}/tags`, {
      name: tagName,
    });
  }

  async deleteTagById(id: string, tagName: string) {
    return this.delete<Tag>(`/chats/${id}/tags`, {
      body: JSON.stringify({
        name: tagName,
      }),
    });
  }

  async deleteTagsById(id: string) {
    return this.delete<Tag>(`/chats/${id}/tags/all`);
  }

  async deleteAllChats() {
    return this.delete<Chat>(`/chats/`);
  }

  async archiveAllChats() {
    return this.post<Chat>(`/chats/archive/all`);
  }

  async startStream({ model, role, content, conversation, queryClient }: StartStreamProps) {
    const input = Array.isArray(content)
      ? [{ role, content }]
      : [{ role, content: [{ type: "input_text", text: content }] }];
    return this.stream("/responses", { model, input, conversation, stream: true }, { apiVersion: "v2", queryClient });
  }

  async getFiles() {
    return this.get<FilesOpenaiResponse>("/files", { apiVersion: "v2" });
  }

  //https://platform.openai.com/docs/api-reference/files/create?lang=node.js
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", "assistants");
    formData.append("expires_after[anchor]", "created_at");
    formData.append("expires_after[seconds]", "3600");

    return this.post<FileOpenAIResponse>("/files", formData, {
      apiVersion: "v2",
      withoutHeaders: true,
    });
  }

  async deleteFile(id: string) {
    return this.delete(`/files/${id}`, { apiVersion: "v2" });
  }
}

export const chatClient = new ChatClient();
