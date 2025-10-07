import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { XMarkIcon, CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { copyToClipboard } from '@/lib/index';
import { verifySignature } from '@/lib/signature';

interface VerifySignatureDialogProps {
	show: boolean;
	address: string;
	message: string;
	signature: string;
	onClose: () => void;
}

type VerifyStatus = 'pending' | 'success' | 'error';

const VerifySignatureDialog: React.FC<VerifySignatureDialogProps> = ({
	show,
	address,
	message,
	signature,
	onClose
}) => {
	const { t } = useTranslation('translation', { useSuspense: false });
	const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>('pending');
	const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (show && address && message && signature) {
			setVerifyStatus('pending');
			const isValid = verifySignature(address, message, signature);
			setVerifyStatus(isValid ? 'success' : 'error');
		}
	}, [show, address, message, signature]);

	useEffect(() => {
		if (show) {
			setCheckedMap({});
		}
	}, [show]);

	const handleCopy = async (text: string, key: string) => {
		const success = await copyToClipboard(text);
		if (success) {
			toast.success(t('Copied to clipboard'));
			setCheckedMap((prev) => ({ ...prev, [key]: true }));
		}
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	if (!show) return null;

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
			onClick={handleBackdropClick}
		>
			<div
				className="bg-white dark:bg-gray-875 border dark:border-[rgba(255,255,255,0.1)] rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="flex px-6 pt-6 pb-3 items-center justify-between border-gray-200 dark:border-gray-700">
					<p className="text-lg text-gray-900 dark:text-white gap-2 flex items-center">
						{t('Signature Verification')}
					</p>
					<button
						onClick={onClose}
						className="text-white shadow hover:text-gray-600 dark:hover:text-gray-300 h-8 w-8 rounded flex items-center justify-center dark:bg-[rgba(248,248,248,0.04)] transition-colors"
					>
						<XMarkIcon className="w-6 h-6" />
					</button>
				</div>

				{/* Content */}
				<div className="px-6 pt-4 pb-6">
					{/* Status */}
					{verifyStatus === 'success' && (
						<div className="mb-4 py-2 px-2.5 text-green-700 dark:text-green-300 bg-green-50 dark:bg-[rgba(0,236,151,0.08)] border border-green-200 dark:border-[rgba(0,236,151,0.08)] rounded-lg text-sm">
							<CheckIcon className="w-5 h-5 text-green-500 dark:text-[rgba(0,236,151,1)] mr-0.5 inline-block" />
							Message Signature Verified. The message signature has been confirmed to be signed by
							the address using the
							<a
								className="text-blue-500 underline"
								href="https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm"
								rel="noopener noreferrer"
								target="_blank"
							>
								ECDSA
							</a>
							algorithm.
						</div>
					)}
					{verifyStatus === 'error' && (
						<p className="flex items-center gap-2 mb-4 py-2 px-2.5 text-[#b02a37] bg-[#f8d7da] border border-[#f1aeb5] rounded-lg text-sm">
							{t('Sorry! The Message Signature Verification Failed')}
						</p>
					)}

					{/* Form */}
					<form
						className="flex flex-col w-full"
						onSubmit={(e) => {
							e.preventDefault();
						}}
					>
						{/* Address Field */}
						<div className="flex flex-col w-full mb-3">
							<div className="mb-2 text-black dark:text-[rgba(161,161,161,1)] text-sm flex items-center justify-between">
								<span>{t('Address')}</span>
								<button
									type="button"
									className="flex items-center gap-x-1 bg-none border-none text-xs bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 transition rounded-md px-2 py-1"
									onClick={() => handleCopy(address, 'address')}
								>
									{checkedMap['address'] ? (
										<CheckIcon className="w-4 h-4" />
									) : (
										<ClipboardIcon className="w-4 h-4" />
									)}
									{t('Copy')}
								</button>
							</div>
							<div className="flex-1">
								<input
									className="w-full placeholder:text-[rgba(161,161,161,1)] dark:text-[rgba(161,161,161,1)] text-sm outline-hidden py-2 px-3 border rounded border-gray-300/50 dark:border-[rgba(248,248,248,0.08)] dark:bg-[rgba(248,248,248,0.04)]"
									type="text"
									autoComplete="off"
									value={address}
									placeholder="0x..."
									disabled
									required
								/>
							</div>
						</div>

						{/* Message Field */}
						<div className="flex flex-col w-full mb-3">
							<div className="mb-2 text-black dark:text-[rgba(161,161,161,1)] text-sm flex items-center justify-between">
								<span>{t('Message')}</span>
								<button
									type="button"
									className="flex items-center gap-x-1 bg-none border-none text-xs bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 transition rounded-md px-2 py-1"
									onClick={() => handleCopy(message, 'message')}
								>
									{checkedMap['message'] ? (
										<CheckIcon className="w-4 h-4" />
									) : (
										<ClipboardIcon className="w-4 h-4" />
									)}
									{t('Copy')}
								</button>
							</div>
							<div className="flex-1">
								<textarea
									className="w-full placeholder:text-[rgba(161,161,161,1)] dark:text-[rgba(161,161,161,1)] text-sm outline-hidden py-2 px-3 border rounded border-gray-300/50 dark:border-[rgba(248,248,248,0.08)] dark:bg-[rgba(248,248,248,0.04)]"
									rows={3}
									required
									value={message}
									disabled
									maxLength={60000}
								/>
							</div>
						</div>

						{/* Signature Field */}
						<div className="flex flex-col w-full mb-6">
							<div className="mb-2 text-black dark:text-[rgba(161,161,161,1)] text-sm flex items-center justify-between">
								<span>{t('Signature')}</span>
								<button
									type="button"
									className="flex items-center gap-x-1 bg-none border-none text-xs bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 transition rounded-md px-2 py-1"
									onClick={() => handleCopy(signature, 'signature')}
								>
									{checkedMap['signature'] ? (
										<CheckIcon className="w-4 h-4" />
									) : (
										<ClipboardIcon className="w-4 h-4" />
									)}
									{t('Copy')}
								</button>
							</div>
							<div className="flex-1">
								<textarea
									className="w-full dark:text-[rgba(161,161,161,1)] placeholder:text-[rgba(161,161,161,1)] text-sm outline-hidden py-2 px-3 border rounded border-gray-300/50 dark:border-[rgba(248,248,248,0.08)] dark:bg-[rgba(248,248,248,0.04)]"
									value={signature}
									rows={3}
									required
									disabled
									maxLength={60000}
								/>
							</div>
						</div>

						{/* Close Button */}
						<div className="flex w-full justify-end items-center">
							<button
								className="px-4 py-2 text-sm font-medium bg-gray-700/5 hover:bg-gray-700/10 dark:bg-gray-100/5 dark:hover:bg-gray-100/10 dark:text-gray-300 dark:hover:text-white transition rounded-lg"
								type="button"
								onClick={onClose}
							>
								{t('Close')}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default VerifySignatureDialog;
