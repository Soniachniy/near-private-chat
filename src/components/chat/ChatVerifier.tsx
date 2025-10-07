import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import ModelVerifier from './ModelVerifier';
import MessagesVerifier from './MessagesVerifier';

import { useChatStore } from '@/stores/useChatStore';
import IntelLogo from '@/assets/images/intel-2.svg';
import NvidiaLogo from '@/assets/images/nvidia-2.svg';
import SafeLogo from '@/assets/images/safe.svg';
import { cn } from '@/lib/utils';
import type { VerificationStatus } from './types';
import { useTranslation } from 'react-i18next';
import { useViewStore } from '@/stores/useViewStore';

const ChatVerifier: React.FC = () => {
	const { t } = useTranslation('translation', { useSuspense: false });
	//TODO: Use the chatId from the useLocation hook

	const { currentChat, selectedModels } = useChatStore();

	const { isRightSidebarOpen, setIsRightSidebarOpen } = useViewStore();
	const [showModelVerifier, setShowModelVerifier] = useState(false);
	const [modelVerificationStatus, setModelVerificationStatus] = useState<VerificationStatus | null>(
		null
	);

	const toggleVerifier = () => {
		setIsRightSidebarOpen(!isRightSidebarOpen);
	};

	const openModelVerifier = () => {
		setShowModelVerifier(true);
	};

	const closeModelVerifier = () => {
		setShowModelVerifier(false);
	};

	const handleModelStatusUpdate = (status: VerificationStatus) => {
		setModelVerificationStatus(status);
	};

	useEffect(() => {
		if (!isRightSidebarOpen) {
			setModelVerificationStatus(null);
		}
	}, [isRightSidebarOpen]);

	return (
		<div className="relative z-50">
			<div
				id="chat-verifier-sidebar"
				className={cn(
					'h-screen max-h-[100dvh] min-h-screen select-none overflow-y-hidden',
					'shrink-0 bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-200 text-sm fixed z-50 top-0 right-0 overflow-x-hidden',
					isRightSidebarOpen ? 'md:relative w-[320px] max-w-[320px]' : 'translate-x-[320px] w-[0px]'
				)}
			>
				<div className="flex w-[320px] items-center justify-between px-4 pb-4 pt-3.5">
					<h2 className="text-base text-gray-900 dark:text-white gap-2 flex items-center">
						<img alt="safe" src={SafeLogo} className="w-6 h-6" />
						{t('AI Chat Verification')}
					</h2>
					<button
						onClick={toggleVerifier}
						className="text-white shadow hover:text-gray-600 dark:hover:text-gray-300 h-8 w-8 rounded flex items-center justify-center dark:bg-[rgba(248,248,248,0.04)] transition-colors"
					>
						<XMarkIcon className="w-5 h-5" />
					</button>
				</div>

				<div className="h-full w-[320px] flex flex-col">
					<div className="flex-shrink-0 dark:border-gray-700">
						<div className="p-4">
							<h2 className="text-base font-semibold text-gray-900 flex rounded items-center dark:text-gray-300 h-8 mb-3">
								{t('Model Verification')}
							</h2>

							<ModelVerifier
								model={selectedModels[0] || ''}
								show={false}
								autoVerify={isRightSidebarOpen && !!selectedModels[0]}
								onClose={() => {}}
								onStatusUpdate={handleModelStatusUpdate}
							/>

							{modelVerificationStatus?.loading ? (
								<div className="flex items-center justify-center py-4">
									<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-300"></div>
									<span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
										{t('Verifying confidentiality...')}
									</span>
								</div>
							) : modelVerificationStatus?.error ? (
								<>
									<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
										<div className="flex items-center">
											<XCircleIcon className="w-4 h-4 text-red-400 mr-2" />
											<span className="text-red-800 dark:text-red-200 text-sm">
												{modelVerificationStatus.error}
											</span>
										</div>
									</div>
									<button
										onClick={() => setModelVerificationStatus(null)}
										disabled={!selectedModels[0]}
										className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
									>
										{t('Retry Verification')}
									</button>
								</>
							) : modelVerificationStatus?.isVerified ? (
								<>
									<div className="bg-green-50 dark:bg-emerald-300/10 border border-green-200 dark:border-emerald-300/10 rounded-lg p-3 mb-3">
										<div className="flex items-center mb-2">
											<CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
											<span className="text-green-700 dark:text-emerald-300 text-sm font-medium">
												{t('Your chat is confidential.')}
											</span>
										</div>
										<div className="mb-2">
											<p className="text-xs text-gray-600 dark:text-[rgba(248,248,248,0.64)] mb-2">
												{t('Attested by')}
											</p>
											<div className="flex items-center space-x-4">
												<div className="flex space-x-2">
													<img src={NvidiaLogo} alt="NVIDIA" className="w-16 h-6" />
												</div>
												<span className="text-[rgba(248,248,248,0.64)] text-xs">{t('and')}</span>
												<div className="flex space-x-2">
													<img src={IntelLogo} alt="Intel" className="w-12 h-6" />
												</div>
											</div>
										</div>
										<p
											style={{ lineHeight: '1.5em' }}
											className="text-xs text-gray-600 dark:text-gray-400"
										>
											{t(
												'This automated verification tool lets you independently confirm that the model is running in the TEE (Trusted Execution Environment).'
											)}
										</p>
									</div>
									<button
										onClick={openModelVerifier}
										className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[rgba(248,248,248,0.08)] text-gray-700 dark:text-white text-sm rounded-md transition-colors"
									>
										{t('View Verification Details')}
									</button>
								</>
							) : (
								<div className="flex items-center justify-center py-4">
									<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
									<span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
										{t('Verifying confidentiality...')}
									</span>
								</div>
							)}
						</div>
					</div>

					{currentChat && (
						<div className="flex-1 overflow-hidden">
							<div className="h-full flex flex-col">
								<div className="flex-shrink-0">
									<h2 className="text-base font-semibold text-gray-900 flex rounded items-center pl-4 dark:text-gray-300 h-8">
										{t('Messages Verification')}
									</h2>
								</div>
								<div className="flex-1 overflow-y-auto">
									<MessagesVerifier
										history={currentChat.chat.history || { messages: {}, currentId: null }}
										chatId={currentChat.id}
									/>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			<ModelVerifier
				model={selectedModels[0] || ''}
				show={showModelVerifier}
				onClose={closeModelVerifier}
			/>
		</div>
	);
};

export default ChatVerifier;
