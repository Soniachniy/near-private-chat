import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
	ChevronDownIcon,
	ArrowPathIcon,
	XCircleIcon,
	ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { nearAIClient, type MessageSignature } from '@/api/nearai/client';
import { useMessagesSignaturesStore } from '@/stores/useMessagesSignaturesStore';
import VerifySignatureDialog from './VerifySignatureDialog';
import type { Message } from '@/types';
import VerifiedLogo from '@/assets/images/verified.svg';
import { useTranslation } from 'react-i18next';

interface MessagesVerifierProps {
	history: {
		messages: Record<string, Message>;
		currentId: string | null;
	};
	chatId?: string | null;
}

const MessagesVerifier: React.FC<MessagesVerifierProps> = ({ history, chatId }) => {
	const { t } = useTranslation('translation', { useSuspense: false });
	const { messagesSignatures, setMessageSignature } = useMessagesSignaturesStore();

	const [loadingSignatures, setLoadingSignatures] = useState<Set<string>>(new Set());
	const [errorSignatures, setErrorSignatures] = useState<Record<string, string>>({});
	const [error, setError] = useState<string | null>(null);
	const [selectedMessageId, setSelectedMessageId] = useState<string>('');
	const [lastCurrentId, setLastCurrentId] = useState<string>('');
	const [showVerifySignatureDialog, setShowVerifySignatureDialog] = useState(false);
	const [selectedSignature, setSelectedSignature] = useState<MessageSignature | null>(null);
	const [viewMore, setViewMore] = useState(false);

	const containerRef = useRef<HTMLDivElement>(null);

	const chatCompletions = useMemo(() => {
		if (!history) return [];
		return Object.values(history.messages).filter(
			(message) => message.role === 'assistant' && message.done === true
		);
	}, [history]);

	useEffect(() => {
		if (history?.currentId && history.messages[history.currentId]?.chatCompletionId) {
			if (history.currentId !== lastCurrentId || !selectedMessageId) {
				setSelectedMessageId(history.messages[history.currentId].chatCompletionId!);
			}
			setLastCurrentId(history.currentId);
		}
	}, [history, lastCurrentId, selectedMessageId]);

	const messageList = viewMore ? chatCompletions : chatCompletions.slice(0, 2);

	// Function to fetch message signature
	const fetchMessageSignature = useCallback(
		async (msgId: string) => {
			const token = localStorage.getItem('token');
			if (!token || !history || !chatCompletions.length || !msgId) return;
			const msg = chatCompletions.find((message) => message.chatCompletionId === msgId);
			if (!msg || !msg.chatCompletionId || messagesSignatures[msg.chatCompletionId]) return;
			if (loadingSignatures.has(msg.chatCompletionId)) return;

			setLoadingSignatures((prev) => new Set(prev).add(msg.chatCompletionId!));

			try {
				const data = await nearAIClient.getMessageSignature(
					msg.model || 'gpt-3.5-turbo',
					msg.chatCompletionId
				);
				if (!data || !data.signature) {
					const errorMsg =
						data?.detail || data?.message || 'No signature data found for this message';
					setErrorSignatures((prev) => ({ ...prev, [msg.chatCompletionId!]: errorMsg }));
					setError(errorMsg);
					return;
				}
				setMessageSignature(msg.chatCompletionId, data);
				setErrorSignatures((prev) => {
					const newErrors = { ...prev };
					delete newErrors[msg.chatCompletionId!];
					return newErrors;
				});
			} catch (err) {
				console.error('Error fetching message signature:', err);
				const errorMsg = err instanceof Error ? err.message : 'Failed to fetch message signature';
				setErrorSignatures((prev) => ({ ...prev, [msg.chatCompletionId!]: errorMsg }));
				setError(errorMsg);
			} finally {
				setLoadingSignatures((prev) => {
					const newSet = new Set(prev);
					newSet.delete(msg.chatCompletionId!);
					return newSet;
				});
			}
		},
		[history, chatCompletions, messagesSignatures, loadingSignatures, setMessageSignature]
	);

	const scrollToSelectedMessage = useCallback(() => {
		if (!containerRef.current || !selectedMessageId) return;

		setTimeout(() => {
			const selectedElement = containerRef.current?.querySelector(
				`[data-message-id="${selectedMessageId}"]`
			) as HTMLElement;
			if (selectedElement) {
				const scrollContainer = selectedElement.closest('.overflow-y-auto') as HTMLElement;
				if (scrollContainer) {
					const containerRect = scrollContainer.getBoundingClientRect();
					const elementRect = selectedElement.getBoundingClientRect();
					const scrollTop =
						selectedElement.offsetTop -
						scrollContainer.offsetTop -
						containerRect.height / 2 +
						elementRect.height / 2;

					scrollContainer.scrollTo({
						top: scrollTop,
						behavior: 'smooth'
					});
				} else {
					selectedElement.scrollIntoView({
						behavior: 'smooth',
						block: 'center',
						inline: 'nearest'
					});
				}
			} else {
				console.log('Could not find element with data-message-id:', selectedMessageId);
			}
		}, 300);
	}, [selectedMessageId]);

	useEffect(() => {
		if (selectedMessageId) {
			scrollToSelectedMessage();
		}
	}, [selectedMessageId, scrollToSelectedMessage]);

	const openVerifySignatureDialog = () => {
		if (!messagesSignatures[selectedMessageId]) return;
		if (!messagesSignatures[selectedMessageId].signature) return;
		setShowVerifySignatureDialog(true);
		setSelectedSignature(messagesSignatures[selectedMessageId]);
	};

	const closeVerifySignatureDialog = () => {
		setShowVerifySignatureDialog(false);
		setSelectedSignature(null);
	};

	useEffect(() => {
		setSelectedMessageId('');
	}, [chatId]);

	useEffect(() => {
		if (selectedMessageId) {
			fetchMessageSignature(selectedMessageId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedMessageId]);

	return (
		<div className="space-y-4 h-full overflow-y-auto pb-4 px-4" ref={containerRef}>
			{error ? (
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
					<div className="flex items-center">
						<XCircleIcon className="w-5 h-5 text-red-400 mr-2" />
						<span className="text-red-800 dark:text-red-200">{error}</span>
					</div>
				</div>
			) : chatCompletions.length > 0 ? (
				<div className="space-y-4">
					<p className="text-xs mt-4 text-gray-900 uppercase dark:text-[rgba(161,161,161,1)]">
						{t('Verifiable Messages')} ({chatCompletions.length})
					</p>

					{messageList.map((message, index) => (
						<div
							key={message.chatCompletionId}
							className={`bg-green-50 text-xs dark:bg-[rgba(0,236,151,0.08)] border border-green-200 dark:border-[rgba(0,236,151,0.16)] rounded-lg my-2 p-2 relative cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors ${
								selectedMessageId === message.chatCompletionId
									? 'ring-1 ring-green-700 dark:bg-[rgba(0,236,151,0.15)]'
									: ''
							}`}
							onClick={() =>
								message.chatCompletionId && setSelectedMessageId(message.chatCompletionId)
							}
							title="Click to view signature details"
							data-message-id={message.chatCompletionId}
						>
							<div className="mb-3">
								<h4 className="text-sm font-medium text-gray-900 flex items-center justify-between dark:text-white mb-3">
									<span>
										{t('Message')} {index + 1}
									</span>
									<div className="flex items-center space-x-1">
										<img src={VerifiedLogo} alt="Verified" />
									</div>
								</h4>
								<p
									className={`text-xs text-gray-700 dark:text-[rgba(248,248,248,0.88)] mb-2 line-clamp-2 ${
										selectedMessageId === message.chatCompletionId ? 'dark:text-white' : ''
									}`}
								>
									{message.content}
								</p>
								<p className="text-xs text-gray-500 dark:text-[rgba(248,248,248,0.64)]">
									{t('ID')}: {message.chatCompletionId}
								</p>
							</div>
						</div>
					))}

					{chatCompletions.length > 2 && (
						<button
							className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 gap-2.5 hover:bg-gray-200 dark:bg-[rgba(248,248,248,0.08)] text-gray-700 dark:text-white text-sm rounded-md transition-colors"
							onClick={() => setViewMore(!viewMore)}
						>
							{viewMore ? t('View Less') : t('View More')}
							<ChevronDownIcon
								className={`w-4 h-4 ${viewMore ? 'rotate-180' : ''}`}
								strokeWidth={2.5}
							/>
						</button>
					)}

					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<p className="text-xs text-gray-900 uppercase dark:text-[rgba(161,161,161,1)] mt-4">
								{t('Signature Details')}
							</p>
						</div>

						{selectedMessageId && messagesSignatures[selectedMessageId] ? (
							<>
								{messagesSignatures[selectedMessageId].signature && (
									<button
										className="flex items-center text-green-500 hover:text-green-700 text-xs transition-colors mb-4"
										onClick={openVerifySignatureDialog}
									>
										<ArrowTopRightOnSquareIcon className="w-3 h-3 mr-1" />
										{t('Verify the ECDSA Signature')}
									</button>
								)}

								<div className="rounded-lg min-h-[150px]">
									<div className="mb-2">
										<label className="block text-xs text-gray-700 dark:text-[rgba(161,161,161,1)] mb-1">
											{t('Signing Address')}:
										</label>
										<div className="px-2 py-1 bg-gray-100 dark:bg-[rgba(248,248,248,0.04)] border border-gray-300 dark:border-[rgba(248,248,248,0.08)] rounded text-xs font-mono break-all min-h-[24px] flex items-center">
											{messagesSignatures[selectedMessageId].signing_address ?? ''}
										</div>
									</div>

									<div className="mb-2">
										<label className="block text-xs text-gray-700 dark:text-[rgba(161,161,161,1)] mb-1">
											{t('Message')}:
										</label>
										<div className="px-2 py-1 bg-gray-100 dark:bg-[rgba(248,248,248,0.04)] border border-gray-300 dark:border-[rgba(248,248,248,0.08)] rounded text-xs font-mono break-all min-h-[24px] flex items-center">
											{messagesSignatures[selectedMessageId].text ?? ''}
										</div>
									</div>

									<div className="mb-2">
										<label className="block text-xs text-gray-700 dark:text-[rgba(161,161,161,1)] mb-1">
											{t('Signature')}:
										</label>
										<div className="px-2 py-1 bg-gray-100 dark:bg-[rgba(248,248,248,0.04)] border border-gray-300 dark:border-[rgba(248,248,248,0.08)] rounded text-xs font-mono break-all min-h-[24px] flex items-center">
											{messagesSignatures[selectedMessageId].signature ?? ''}
										</div>
									</div>

									<div>
										<label className="block text-xs text-gray-700 dark:text-[rgba(161,161,161,1)] mb-1">
											{t('Algorithm')}:
										</label>
										<div className="px-2 py-1 bg-gray-100 dark:bg-[rgba(248,248,248,0.04)] border border-gray-300 dark:border-[rgba(248,248,248,0.08)] rounded text-xs min-h-[24px] flex items-center">
											{messagesSignatures[selectedMessageId].signing_algo ?? ''}
										</div>
									</div>
								</div>
							</>
						) : selectedMessageId ? (
							loadingSignatures.has(selectedMessageId) ? (
								<div className="rounded-lg min-h-[150px] flex items-center justify-center">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[rgba(0,236,151,1)]"></div>
								</div>
							) : errorSignatures[selectedMessageId] ? (
								<div className="rounded-lg min-h-[150px] flex items-center justify-center">
									<div className="text-center py-2 text-gray-500 dark:text-gray-400">
										<p className="text-xs">{t('No signature data found for this message.')}</p>
									</div>

									<button
										title={t('Retry')}
										type="button"
										className="hover:opacity-75 ml-1 cursor-pointer"
										onClick={() => fetchMessageSignature(selectedMessageId)}
									>
										<ArrowPathIcon className="w-3.5 h-3.5 text-[rgba(0,236,151,1)]" />
									</button>
								</div>
							) : (
								<div className="rounded-lg min-h-[150px] flex items-center justify-center">
									<div className="text-center py-2 text-gray-500 dark:text-gray-400">
										<p className="text-xs">{t('No signature data found for this message.')}</p>
									</div>
								</div>
							)
						) : (
							<div className="rounded-lg min-h-[150px] flex items-center justify-center">
								<div className="text-center py-2 text-gray-500 dark:text-gray-400">
									<p className="text-xs">
										{t('Click on a message above to view signature details')}
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			) : (
				<div className="text-center py-8 text-gray-500 dark:text-gray-400">
					<p className="text-sm">{t('No verifiable messages found for this chat.')}</p>
				</div>
			)}

			<div className="h-10"></div>

			<VerifySignatureDialog
				show={showVerifySignatureDialog}
				address={selectedSignature?.signing_address ?? ''}
				message={selectedSignature?.text ?? ''}
				signature={selectedSignature?.signature ?? ''}
				onClose={closeVerifySignatureDialog}
			/>
		</div>
	);
};

export default MessagesVerifier;
