import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import MessageInput from '@/components/chat/MessageInput';
import ChatPlaceholder from '@/components/chat/ChatPlaceholder';
import UserMessage from '@/components/chat/messages/UserMessage';
import ResponseMessage from '@/components/chat/messages/ResponseMessage';
import MultiResponseMessages from '@/components/chat/messages/MultiResponseMessages';

import { useChatStore } from '@/stores/useChatStore';
import { useChatWebSocket } from '@/api/chat/websocket/useChatWebSocket';
import { useChatById } from '@/api/chat/queries';
import type { Message, ChatHistory } from '@/types';

import { v4 as uuidv4 } from 'uuid';
import Navbar from '@/components/chat/Navbar';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TEMP_API_BASE_URL } from '@/api/constants';
import MessageSkeleton from '@/components/chat/MessageSkeleton';
import { chatClient } from '@/api/chat/client';

interface SendPromptParams {
	prompt: string;
	chatId?: string;
	model?: string;
	files?: File[];
}

const Home: React.FC = () => {
	const { chatId } = useParams<{ chatId: string }>();
	const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
	const { selectedModels, addMessage, updateMessage, currentChat, models } = useChatStore();
	const messagesContainerElement = useRef<HTMLDivElement>(null);
	const { isLoading: isChatLoading } = useChatById({ id: currentChatId || '', setCurrentMessages }, { enabled: !!currentChatId });
	const { socket } = useChatWebSocket(setCurrentMessages);

	const handleSendMessage = async (content: string) => {
		if (!content || !selectedModels.length) return;
		sendPromptMutation(
			{
				prompt: content,
				chatId: currentChatId
			},
			{
				onSuccess: (data) => {
					if (!currentChatId && data.chatId) {
						navigate(`/c/${data.chatId}`);
					}
				}
			}
		);
	};

	const handleEditMessage = (messageId: string, content: string) => {
		console.log('Edit message:', messageId, content);
		updateMessage(messageId, { content });
	};

	const handleSaveMessage = (messageId: string, content: string) => {
		console.log('Save message:', messageId, content);
		updateMessage(messageId, { content });
	};

	const handleDeleteMessage = (messageId: string) => {
		console.log('Delete message:', messageId);
	};

	const handleRegenerateResponse = () => {
		console.log('Regenerate response');
	};

	const handleMergeResponses = () => {
		console.log('Merge responses');
	};

	const { mutate: sendPromptMutation } = useMutation({
		mutationFn: async ({ prompt, model, files }: SendPromptParams) => {
			const token = localStorage.getItem('token');
			if (!token) throw new Error('No token found');

			// Validate
			if (!prompt && (!files || files.length === 0)) {
				throw new Error('Please enter a prompt');
			}

			const selectedModel = model || selectedModels[0];
			if (!selectedModel || selectedModel === '') {
				throw new Error('Model not selected');
			}

			// Create user message
			const userMessageId = uuidv4();
			const userMessage: Message = {
				id: userMessageId,
				parentId: null,
				childrenIds: [],
				role: 'user',
				content: prompt,
				timestamp: Math.floor(Date.now() / 1000),
				models: [selectedModel],
				modelName: '',
				done: true
			};

			// Add user message to store
			addMessage(userMessage);
			setCurrentMessages((prevMessages: Message[]) => [...prevMessages, userMessage]);

			// Create assistant message
			const assistantMessageId = uuidv4();
			const modelInfo = models.find((m) => m.id === selectedModel);
			const assistantMessage: Message = {
				id: assistantMessageId,
				parentId: userMessageId,
				childrenIds: [],
				role: 'assistant',
				content: '',
				timestamp: Math.floor(Date.now() / 1000),
				models: [selectedModel],
				modelName: modelInfo?.name || selectedModel,
				model: selectedModel,
				done: false
			};

			// Add assistant message to store
			addMessage(assistantMessage);
			setCurrentMessages((prevMessages: Message[]) => [...prevMessages, assistantMessage]);

			userMessage.childrenIds = [assistantMessageId];
			updateMessage(userMessageId, {
				childrenIds: [assistantMessageId]
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
				// Create new chat
				const newChatHistory: ChatHistory = {
					messages: {
						[userMessageId]: userMessage,
						[assistantMessageId]: assistantMessage
					},
					currentId: assistantMessageId
				};
				const newChat = await chatClient.createNewChat({
					id: uuidv4(),
					title: prompt.slice(0, 50),
					models: [selectedModel],
					history: newChatHistory,
					messages: [userMessage, assistantMessage],
					timestamp: Date.now()
				});

				queryClient.invalidateQueries({ queryKey: ['chats'] });
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
						[assistantMessageId]: assistantMessage
					},
					currentId: assistantMessageId
				},
				models: selectedModels,
				params: currentChat?.chat.params,
				files: currentChat?.chat.files
			});
			console.log('updatedChat', updatedChat);

			// Build messages array with full conversation history
			const allMessages = [...currentMessages, userMessage].map((msg) => ({
				role: msg.role,
				content: msg.content,
				...(msg.files ? { files: msg.files } : {})
			}));

			// Get model item for the selected model
			const modelItem = models.find((m) => m.id === selectedModel);

			// Determine if this is the first message in a new chat (for background tasks)
			const isFirstMessage = allMessages.length === 1;

			// Send chat completion request with all required fields matching Svelte implementation
			const response = await fetch(`${TEMP_API_BASE_URL}/api/chat/completions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					model: selectedModel,
					messages: allMessages,
					stream: true,
					params: {}, // Model-specific parameters
					files: [], // Files attached to the chat
					tool_ids: [], // Selected tool IDs
					tool_servers: [], // Tool servers configuration
					features: {
						image_generation: false,
						code_interpreter: false,
						web_search: false
					},
					variables: {}, // Template variables
					model_item: modelItem || {}, // Full model object
					session_id: socket?.id || undefined,
					chat_id: localChatId,
					id: assistantMessageId, // CRITICAL: Backend expects "id", not "message_id"
					// Only include background_tasks for the first message
					...(isFirstMessage
						? {
								background_tasks: {
									title_generation: true,
									tags_generation: true
								}
							}
						: {})
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.detail || 'Failed to send message');
			}

			messagesContainerElement.current?.scrollIntoView({ behavior: 'smooth' });

			return {
				chatId: currentChatId,
				userMessageId,
				assistantMessageId
			};
		},
		onSuccess: () => {},
		onError: (error) => {
			console.error('Failed to send message:', error);
		}
	});

	useEffect(() => {
		setCurrentChatId(chatId);

		messagesContainerElement.current?.scrollIntoView({ behavior: 'smooth' });

		const element = document.getElementById('messages-container');
		element?.scrollTo({
			top: element.scrollHeight,
			behavior: 'smooth'
		});
	}, [chatId]);

	if (isChatLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center">
					<div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
					<div className="text-sm text-gray-500 dark:text-gray-400">Loading chat...</div>
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
						await handleSendMessage(voice);
					}}
					submitPrompt={async (prompt) => {
						await handleSendMessage(prompt);
					}}
				/>
			</>
		);
	}

	// console.log(currentMessages, currentChat, currentMessages.length);
	return (
		<div className="flex flex-col h-full bg-gray-900">
			{/* Messages */}
			<Navbar />
			<div className="flex-1 overflow-y-auto px-4 py-4 pt-8 space-y-4" id="messages-container">
				{/* Messages */}
				{currentMessages.map((message, idx) => {
					// Use the actual history from store instead of creating a mock
					// This ensures all message operations work correctly with the backup
					const siblings = currentMessages.map((m) => m.id);

					if (message.role === 'user') {
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
					} else if (message.content === '' && !message.error) {
						console.log('MessageSkeleton', message);
						return <MessageSkeleton key={message.id} />;
					} else {
						const hasMultipleResponses = message.childrenIds && message.childrenIds.length > 1;

						if (hasMultipleResponses) {
							return (
								<MultiResponseMessages
									key={message.id}
									history={currentChat?.chat.history || { messages: {}, currentId: null }}
									messageId={message.id}
									isLastMessage={idx === currentMessages.length - 1}
									readOnly={false}
									webSearchEnabled={false}
									saveMessage={handleSaveMessage}
									deleteMessage={handleDeleteMessage}
									regenerateResponse={handleRegenerateResponse}
									mergeResponses={handleMergeResponses}
								/>
							);
						} else {
							return (
								<ResponseMessage
									key={message.id}
									history={currentChat?.chat.history || { messages: {}, currentId: null }}
									messageId={message.id}
									siblings={siblings}
									isLastMessage={idx === currentMessages.length - 1}
									readOnly={false}
									webSearchEnabled={false}
									saveMessage={handleSaveMessage}
									deleteMessage={handleDeleteMessage}
									regenerateResponse={handleRegenerateResponse}
								/>
							);
						}
					}
				})}
				<div ref={messagesContainerElement} />
			</div>

			<MessageInput
				messages={currentChat?.chat.messages}
				onSubmit={handleSendMessage}
				createMessagePair={handleSendMessage}
			/>
		</div>
	);
};

export default Home;
