import { useEffect, useRef, useCallback, useState } from 'react';

import { io, Socket } from 'socket.io-client';
import { useChatStore } from '../../../stores/useChatStore';
import { TEMP_API_BASE_URL } from '../../constants';
import type { Message } from '@/types';

interface ChatEventData {
	chat_id: string;
	message_id: string;
	data: {
		type:
			| 'status'
			| 'message'
			| 'replace'
			| 'error'
			| 'chat:completion'
			| 'chat:message:delta'
			| 'chat:message'
			| 'chat:message:files'
			| 'chat:title'
			| 'source'
			| 'citation'
			| 'files';
		content?: string;
		description?: string;
		done?: boolean;
		error?: unknown;
		files?: unknown[];
		data?: unknown;
	};
}

interface CompletionData {
	id?: string;
	done?: boolean;
	choices?: Array<{
		message?: {
			content?: string;
		};
		delta?: {
			content?: string;
		};
	}>;
	content?: string;
	sources?: unknown[];
	selected_model_id?: string;
	error?: {
		content?: string;
		message?: string;
	};
	usage?: {
		prompt_tokens?: number;
		completion_tokens?: number;
		total_tokens?: number;
	};
}

export const useChatWebSocket = (
	setCurrentMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
	const socketRef = useRef<Socket | null>(null);
	const [connectionStatus, setConnectionStatus] = useState<
		'connecting' | 'connected' | 'disconnected' | 'error'
	>('disconnected');

	const handleChatCompletion = useCallback(
		(data: CompletionData, messageId: string) => {
			const { id, done, choices, content, sources, selected_model_id, error, usage } = data;

			const { currentChat } = useChatStore.getState();

			if (error) {
				setCurrentMessages((prevMessages: Message[]) => [
					...prevMessages,
					{
						id: messageId,
						content: error.content || error.message || 'An error occurred',
						done: true,
						error: true
					} as Message
				]);

				return;
			}

			if (id) {
				setCurrentMessages((prevMessages: Message[]) => {
					const message = prevMessages.find((message) => message.id === messageId);
					if (message) {
						message.chatCompletionId = id;
					}
					return prevMessages;
				});
			}

			if (sources) {
				setCurrentMessages((prevMessages: Message[]) => {
					const message = prevMessages.find((message) => message.id === messageId);
					if (message) {
						message.sources = sources;
					}
					return prevMessages;
				});
			}

			if (usage) {
				setCurrentMessages((prevMessages: Message[]) => {
					const message = prevMessages.find((message) => message.id === messageId);
					if (message) {
						message.usage = usage;
					}
					return prevMessages;
				});
			}

			if (choices && choices.length > 0) {
				console.log('Choices:', choices);
				const choice = choices[0];

				if (choice.message?.content) {
					setCurrentMessages((prevMessages: Message[]) => {
						const message = prevMessages.find((message) => message.id === messageId);
						if (message) {
							message.content = choice?.message?.content || '';
						}
						return prevMessages;
					});
				} else if (choice.delta?.content) {
					const deltaContent = choice.delta.content;

					const currentMessage = currentChat?.chat.history.messages[messageId];
					if (currentMessage && currentMessage.content === '' && deltaContent === '\n') {
						console.log('Empty response');
					} else {
						setCurrentMessages((prevMessages: Message[]) => {
							const message = prevMessages.find((message) => message.id === messageId);
							if (message) {
								message.content = message.content + deltaContent;
							}
							return prevMessages;
						});
					}
				}
			}

			if (content) {
				setCurrentMessages((prevMessages: Message[]) => {
					const prveMessage = prevMessages.find((message) => message.id === messageId);
					if (prveMessage) {
						prveMessage.content = content;
					}
					return [...prevMessages];
				});
			}

			if (done) {
				setCurrentMessages((prevMessages: Message[]) => {
					const message = prevMessages.find((message) => message.id === messageId);
					if (message) {
						message.done = true;
						message.modelName = selected_model_id || '';
					}
					return prevMessages;
				});
			}
		},

		[setCurrentMessages]
	);

	const handleChatEvent = useCallback(
		(data: ChatEventData) => {
			const { message_id, data: eventData } = data;

			console.log('WebSocket chat event:', data);

			const { updateMessage } = useChatStore.getState();

			const type = eventData.type;

			switch (type) {
				case 'status':
					setCurrentMessages((prevMessages: Message[]) => {
						const message = prevMessages.find((message) => message.id === message_id);
						if (message) {
							message.done = eventData.done;
							message.content = eventData.content || '';
						}
						return prevMessages;
					});
					break;

				case 'chat:completion':
					handleChatCompletion(
						(eventData.data as CompletionData) || (eventData as CompletionData),
						message_id
					);
					break;

				case 'chat:message:delta':
				case 'message':
					if (eventData.content) {
						console.log('Chat message delta:', eventData.content);
						setCurrentMessages((prevMessages: Message[]) => {
							const message = prevMessages.find((message) => message.id === message_id);
							if (message) {
								message.content = message.content + eventData.content;
							}
							return prevMessages;
						});
					}
					break;

				case 'chat:message':
				case 'replace':
					if (eventData.content) {
						updateMessage(message_id, {
							content: eventData.content
						});
					}
					break;

				case 'chat:message:files':
				case 'files':
					if (eventData.files) {
						updateMessage(message_id, {
							files: eventData.files
						});
					}
					break;

				case 'chat:title':
					console.log('Chat title updated:', eventData);
					break;

				case 'error':
					updateMessage(message_id, {
						content: eventData.description || String(eventData.error) || 'An error occurred',
						done: true,
						error: true
					});
					break;

				default:
					console.log('Unknown message type:', type, eventData);
					break;
			}
		},
		[handleChatCompletion, setCurrentMessages]
	);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token || socketRef.current) return;

		setConnectionStatus('connecting');

		const socket = io(TEMP_API_BASE_URL, {
			path: '/ws/socket.io',
			auth: { token },
			transports: ['websocket', 'polling'],
			autoConnect: true,
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			timeout: 10000,
			forceNew: false
		});

		socket.on('connect', () => {
			console.log('WebSocket connected with ID:', socket.id);
			setConnectionStatus('connected');
		});

		socket.on('chat-events', handleChatEvent);

		socket.on('disconnect', (reason) => {
			console.log('WebSocket disconnected:', reason);
			setConnectionStatus('disconnected');
		});

		socket.on('connect_error', (error) => {
			console.error('WebSocket connection error:', error);

			setConnectionStatus('error');
		});

		socket.on('error', (error) => {
			console.error('WebSocket error:', error);
			setConnectionStatus('error');
		});

		socket.on('reconnect', (attemptNumber) => {
			console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
			setConnectionStatus('connected');
		});

		socket.on('reconnect_attempt', (attemptNumber) => {
			console.log(`WebSocket reconnection attempt ${attemptNumber}`);
			setConnectionStatus('connecting');
		});

		socket.on('reconnect_error', (error) => {
			console.error('WebSocket reconnection error:', error);
			setConnectionStatus('error');
		});

		socket.on('reconnect_failed', () => {
			console.error('WebSocket reconnection failed');
			setConnectionStatus('error');
		});

		socketRef.current = socket;

		return () => {
			if (socket.connected) {
				socket.disconnect();
			}
			socketRef.current = null;
		};
	}, [handleChatEvent]);

	return {
		socket: socketRef.current,
		connectionStatus
	};
};
