import type { Chat, ChatInfo, Tag } from '@/types';
import { ApiClient } from '@/api/base-client';
import { getTimeRange } from '@/lib/utils';


class ChatClient extends ApiClient {
	constructor() {
		super({
			apiPrefix: '/api/v1',
			defaultHeaders: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			includeAuth: true
		});
	}

    //TODO: or use createNewChat
    createChat(title: string = 'New Chat'): ChatInfo {
		return {
			id: `chat-${Date.now()}`,
			title,
            content: '',
			created_at: Date.now(),
			updated_at: Date.now().toString()
		};
	}

    async createNewChat(chat: object) {
        return this.post<Chat>('/chats/new', {
            chat: chat
        });
    }

    async importChat(chat: object, meta: object | null, pinned?: boolean, folderId?: string | null) {
        return this.post<Chat>('/chats/import', {
            chat: chat,
            meta: meta ?? {},
            pinned: pinned,
            folder_id: folderId
        });
    }

    async getChatList(page: number | null = null) {
        const searchParams = new URLSearchParams();
        if (page !== null) {
            searchParams.append('page', `${page}`);
        }
        const res = await this.get<ChatInfo[]>(`/chats/?${searchParams.toString()}`);

        return res.map((chat) => ({
            ...chat,
            time_range: getTimeRange(chat.updated_at)
        }));
    }

    //TODO: Is it necessary?
    async getChatListByUserId(userId: string) {
        const res = await this.get<Chat[]>(`/chats/list/user/${userId}`);

        return res.map((chat) => ({
            ...chat,
            time_range: getTimeRange(chat.updated_at)
        }));
    }

    async getArchivedChatList() {
        return this.get<Chat[]>(`/chats/archived`);
    }

    async getAllChats() {
        return this.get<ChatInfo[]>(`/chats/all`);
    }

    async getChatListBySearchText(text: string, page: number = 1) {
        const searchParams = new URLSearchParams();
        searchParams.append('text', text);
        searchParams.append('page', `${page}`);

        const res = await this.get<Chat[]>(`/chats/search?${searchParams.toString()}`);

        return res.map((chat) => ({
            ...chat,
            time_range: getTimeRange(chat.updated_at)
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
            time_range: getTimeRange(chat.updated_at)
        }));
    }

    async getChatListByTagName(tagName: string) {
        const res = await this.post<Chat[]>(`/chats/tags`, {
            name: tagName
        });

        return res.map((chat) => ({
            ...chat,
            time_range: getTimeRange(chat.updated_at)
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
            ...(title && { title: title })
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
            folder_id: folderId
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
            chat: chat
        });
    }

    async deleteChatById(id: string) {
        return this.delete<Chat>(`/chats/${id}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getTagsById(id: string): Promise<Tag[]> {
        return [];
        // return this.get<Tag[]>(`/chats/${id}/tags`);
    }

    async addTagById(id: string, tagName: string) {
        return this.post<Tag>(`/chats/${id}/tags`, {
            name: tagName
        });
    }

    async deleteTagById(id: string, tagName: string) {
        return this.delete<Tag>(`/chats/${id}/tags`, {
            body: JSON.stringify({
                name: tagName
            })
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
}

export const chatClient = new ChatClient();
