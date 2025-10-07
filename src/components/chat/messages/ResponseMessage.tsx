import React, { useState, useRef, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import type { ChatHistory } from '@/types';
import NearAIIcon from '@/assets/images/near-icon.svg?react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import VerifiedIcon from '@/assets/images/verified-2.svg?react';
import { marked } from 'marked';
import { processResponseContent, replaceTokens } from '@/lib/utils/markdown';
import markedKatexExtension from '@/lib/utils/marked-katex-extension';
import markedExtension from '@/lib/utils/extension';
import MarkdownTokens from './MarkdownTokens';

interface ResponseMessageProps {
	history: ChatHistory;
	messageId: string;
	siblings: string[];
	isLastMessage: boolean;
	readOnly: boolean;
	webSearchEnabled: boolean;
	saveMessage: (messageId: string, content: string) => void;
	deleteMessage: (messageId: string) => void;
	regenerateResponse: () => void;
}

const ResponseMessage: React.FC<ResponseMessageProps> = ({
	history,
	messageId,
	isLastMessage,
	readOnly,
	webSearchEnabled,
	saveMessage,
	regenerateResponse
}) => {
	const { settings } = useSettingsStore();

	const [edit, setEdit] = useState(false);
	const [editedContent, setEditedContent] = useState('');

	const messageEditTextAreaRef = useRef<HTMLTextAreaElement>(null);

	const message = history.messages[messageId];

	useEffect(() => {
		if (edit && messageEditTextAreaRef.current) {
			messageEditTextAreaRef.current.focus();
			messageEditTextAreaRef.current.select();
		}
	}, [edit]);

	const handleSave = () => {
		if (editedContent.trim() !== message.content) {
			saveMessage(messageId, editedContent.trim());
		}
		setEdit(false);
		setEditedContent('');
	};

	const handleCancel = () => {
		setEdit(false);
		setEditedContent('');
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast.success('Copied to clipboard');
		} catch {
			toast.error('Failed to copy to clipboard');
		}
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			handleCancel();
		}
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
			handleSave();
		}
	};

	const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		e.target.style.height = '';
		e.target.style.height = `${e.target.scrollHeight}px`;
	};
	const tokens = useMemo(() => {
		if (!message?.content) return [];

		marked.use(markedKatexExtension());
		marked.use(markedExtension());
		const processedContent = replaceTokens(
			processResponseContent(message.content),
			[],
			undefined,
			undefined
		);

		return marked.lexer(processedContent);
	}, [message?.content]);

	if (!message) return null;
	console.log('message', message);
	return (
		<div
			className="flex w-full group"
			id={`message-${message.id}`}
			dir={settings.chatDirection || 'ltr'}
		>
			<div className="shrink-0 ltr:mr-2 rtl:ml-2">
				<NearAIIcon className="w-6 h-6 mt-0.5" />
			</div>

			<div className="flex-auto w-0 pl-1">
				<div className="flex items-center space-x-2">
					<span className="line-clamp-1 font-normal text-black dark:text-white">
						{message.modelName || 'Assistant'}
					</span>

					{/* Verification Badge */}
					<div className="flex items-center ml-3">
						<VerifiedIcon className="h-6" />
					</div>

					{message.timestamp && (
						<div className="self-center text-xs invisible group-hover:visible text-gray-400 font-medium first-letter:capitalize ml-0.5 translate-y-[1px]">
							<span className="line-clamp-1">{formatDate(message.timestamp)}</span>
						</div>
					)}
				</div>

				<div className={`chat-${message.role} w-full min-w-full markdown-prose`}>
					<div>
						{message.files && message.files.length > 0 && (
							<div className="my-1 w-full flex overflow-x-auto gap-2 flex-wrap">
								{message.files.map((file) => (
									<div key={file.id}>
										{file.type === 'image' ? (
											<img src={file.url} alt={message.content} className="max-h-96 rounded-lg" />
										) : (
											<div className="flex items-center space-x-2 text-xs text-gray-500 bg-white dark:bg-gray-850 p-2 rounded">
												<svg
													className="w-4 h-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
												<span>{file.name}</span>
											</div>
										)}
									</div>
								))}
							</div>
						)}

						{edit ? (
							<div className="w-full bg-gray-50 dark:bg-gray-800 rounded-3xl px-5 py-3 my-2">
								<textarea
									id={`message-edit-${message.id}`}
									ref={messageEditTextAreaRef}
									className="bg-transparent outline-hidden w-full resize-none"
									value={editedContent}
									onChange={(e) => setEditedContent(e.target.value)}
									onInput={handleTextareaInput}
									onKeyDown={handleKeyDown}
								/>

								<div className="mt-2 mb-1 flex justify-between text-sm font-medium">
									<div className="flex space-x-1.5">
										<button
											id="close-edit-message-button"
											className="px-4 py-2 bg-white dark:bg-gray-900 hover:bg-gray-100 text-gray-800 dark:text-gray-100 transition rounded-3xl"
											onClick={handleCancel}
										>
											Cancel
										</button>
										<button
											id="confirm-edit-message-button"
											className="px-4 py-2 bg-gray-900 dark:bg-white hover:bg-gray-850 text-gray-100 dark:text-gray-800 transition rounded-3xl"
											onClick={handleSave}
										>
											Save
										</button>
									</div>
								</div>
							</div>
						) : (
							<div className="w-full flex flex-col relative" id="response-content-container">
								{message.content === '' ? (
									<div className="text-gray-500 dark:text-gray-400">
										{webSearchEnabled ? 'Generating search query...' : 'Generating response...'}
									</div>
								) : message.content ? (
									<div className="markdown-content">
										<MarkdownTokens tokens={tokens} id={`message-${message.id}`} />
									</div>
								) : null}

								{/* Citations would go here if needed */}
								{/* Code executions would go here if needed */}
							</div>
						)}
					</div>
				</div>

				{/* Action Buttons */}
				{!edit && (
					<div className="flex justify-start overflow-x-auto buttons text-gray-600 dark:text-gray-500 mt-0.5">
						{/* Action buttons */}
						{!readOnly && (
							<>
								{/* Copy button */}
								<button
									className={`${isLastMessage ? 'visible' : 'invisible group-hover:visible'} p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg dark:hover:text-white hover:text-black transition copy-response-button`}
									onClick={() => {
										copyToClipboard(message.content);
									}}
									title="Copy"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth="2.3"
										stroke="currentColor"
										className="w-4 h-4"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
										/>
									</svg>
								</button>

								{/* Regenerate button */}
								<button
									className={`${isLastMessage ? 'visible' : 'invisible group-hover:visible'} p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg dark:hover:text-white hover:text-black transition`}
									onClick={regenerateResponse}
									title="Regenerate"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth="2.3"
										stroke="currentColor"
										className="w-4 h-4"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
										/>
									</svg>
								</button>
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ResponseMessage;
