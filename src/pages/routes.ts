const CHAT_ID = ':chatId';

export const APP_ROUTES = {
	HOME: '/',
	CHAT: `/c/${CHAT_ID}`,
	WELCOME: '/welcome',
	AUTH: '/auth'
} as const;

export const toChatRoute = (chatId: string) => APP_ROUTES.CHAT.replace(CHAT_ID, chatId);