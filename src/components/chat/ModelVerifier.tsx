import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
	XMarkIcon,
	CheckIcon,
	ClipboardDocumentIcon,
	ChevronDownIcon,
	ArrowPathIcon,
	XCircleIcon,
	ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { copyToClipboard } from '@/lib/index';
import { nearAIClient, type ModelAttestationReport } from '@/api/nearai/client';
import IntelLogo from '@/assets/images/intel-2.svg';
import NvidiaLogo from '@/assets/images/nvidia-2.svg';
import type { VerificationStatus } from './types';

interface ModelVerifierProps {
	model: string;
	show: boolean;
	autoVerify?: boolean;
	onClose: () => void;
	onStatusUpdate?: (status: VerificationStatus) => void;
}

interface ExpandedSections {
	gpu: boolean;
	tdx: boolean;
}

interface CheckedMap {
	[key: string]: boolean;
}

const ModelVerifier: React.FC<ModelVerifierProps> = ({
	model,
	show,
	autoVerify = false,
	onClose,
	onStatusUpdate
}) => {
	const { t } = useTranslation('translation', { useSuspense: false });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [attestationData, setAttestationData] = useState<ModelAttestationReport | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [nvidiaPayload, setNvidiaPayload] = useState<any | null>(null);
	const [intelQuote, setIntelQuote] = useState<string | null>(null);
	const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
		gpu: false,
		tdx: false
	});
	const [checkedMap, setCheckedMap] = useState<CheckedMap>({});

	const fetchAttestationReport = useCallback(async () => {
		const token = localStorage.getItem('token');

		if (!model || !token) return;

		setLoading(true);
		setError(null);

		try {
			const data = await nearAIClient.getModelAttestationReport(token, model);
			setAttestationData(data);
			setNvidiaPayload(JSON.parse(data?.nvidia_payload || '{}'));
			setIntelQuote(data?.intel_quote || null);
		} catch (err) {
			console.error('Error fetching attestation report:', err);
			setError(err instanceof Error ? err.message : 'Failed to fetch attestation report');
		} finally {
			setLoading(false);
		}
	}, [model]);

	const verifyAgain = async () => {
		await fetchAttestationReport();
		setCheckedMap({});
	};

	const handleClose = () => {
		onClose();
		setCheckedMap({});
	};

	const toggleSection = (section: 'gpu' | 'tdx') => {
		setExpandedSections((prev) => ({
			...prev,
			[section]: !prev[section]
		}));
	};

	const handleCopy = async (text: string, key: string) => {
		const success = await copyToClipboard(text);
		if (success) {
			toast.success(t('Copied to clipboard'));
			setCheckedMap((prev) => ({ ...prev, [key]: true }));
		}
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	};

	const verificationStatus: VerificationStatus = useMemo(
		() => ({
			loading,
			error,
			data: attestationData,
			isVerified: !loading && !error && attestationData !== null
		}),
		[loading, error, attestationData]
	);

	useEffect(() => {
		if (autoVerify && onStatusUpdate) {
			onStatusUpdate(verificationStatus);
		}
	}, [autoVerify, onStatusUpdate, verificationStatus]);

	useEffect(() => {
		const token = localStorage.getItem('token');

		if ((show || autoVerify) && model && token) {
			fetchAttestationReport();
		}
	}, [show, autoVerify, model, fetchAttestationReport]);

	useEffect(() => {
		if (!show) {
			setAttestationData(null);
			setError(null);
			setExpandedSections({ gpu: false, tdx: false });
		}
	}, [show]);

	useEffect(() => {
		if (show) {
			setCheckedMap({});
		}
	}, [show]);

	if (!show) return null;

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
			onClick={handleBackdropClick}
		>
			<div
				className="bg-white dark:bg-gray-875 rounded-lg shadow-3xl border-gray-200 dark:border-[rgba(255,255,255,0.04)] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-6 py-4 dark:border-gray-700">
					<p className="text-lg text-gray-900 dark:text-white gap-2 flex items-center">
						{t('Model Verification')}
					</p>
					<button
						onClick={handleClose}
						className="text-white shadow hover:text-gray-600 dark:hover:text-gray-300 h-8 w-8 rounded flex items-center justify-center dark:bg-[rgba(248,248,248,0.04)] transition-colors"
					>
						<XMarkIcon className="w-6 h-6" />
					</button>
				</div>

				<div className="p-6">
					<div className="mb-4">
						<p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
							{t('Verified Model')}
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-400">{model}</p>
					</div>

					<div className="mb-6">
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('Attested by')}</p>
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								<img src={NvidiaLogo} alt="NVIDIA" className="w-20 h-8" />
							</div>
							<p className="text-gray-600 dark:text-gray-400">{t('and')}</p>

							<div className="flex items-center space-x-2">
								<img src={IntelLogo} alt="Intel" className="w-16 h-8" />
							</div>
						</div>
					</div>

					<p className="text-gray-700 dark:text-gray-300 mb-6">
						{t(
							'This automated verification tool lets you independently confirm that the model is running in the TEE (Trusted Execution Environment).'
						)}
					</p>

					{loading && (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgba(0,236,151,1)]"></div>
							<span className="ml-3 text-gray-600 dark:text-gray-400">
								{t('Verifying attestation...')}
							</span>
						</div>
					)}

					{error && (
						<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
							<div className="flex items-center">
								<XCircleIcon className="w-5 h-5 text-red-400 mr-2" />
								<span className="text-red-800 dark:text-red-200">{error}</span>
							</div>
						</div>
					)}

					{attestationData && (
						<div className="space-y-4">
							<div className="bg-gray-50 dark:bg-[rgba(0,236,151,0.08)] rounded-lg p-4">
								<button
									onClick={() => toggleSection('gpu')}
									className="w-full flex items-center justify-between text-left"
								>
									<div className="flex items-center space-x-3">
										<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
											<CheckIcon className="w-4 h-4 text-white" />
										</div>
										<span className="font-medium text-gray-900 dark:text-white">
											{t('GPU Attestation')}
										</span>
									</div>
									<ChevronDownIcon
										className={`w-5 h-5 text-gray-400 transform transition-transform ${
											expandedSections.gpu ? 'rotate-180' : ''
										}`}
									/>
								</button>

								{expandedSections.gpu && (
									<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
										<div className="space-y-4">
											<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
												<div className="flex items-center mb-2">
													<img src={NvidiaLogo} alt="NVIDIA" className="w-20 h-8 mr-2" />
													<span className="text-sm font-medium text-green-900 dark:text-green-100">
														{t('Remote Attestation Service')}
													</span>
												</div>
												<p className="text-xs text-green-800 dark:text-green-200 mb-3">
													{t(
														"This verification uses NVIDIA's Remote Attestation Service (NRAS) to prove that your model is running on genuine NVIDIA hardware in a secure environment. You can independently verify the attestation evidence using NVIDIA's public API."
													)}
												</p>
												<div className="space-y-1">
													<a
														href="https://docs.api.nvidia.com/attestation/reference/attestmultigpu"
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center text-red-500 hover:text-red-600 text-xs transition-colors"
													>
														<ArrowTopRightOnSquareIcon className="w-3 h-3 mr-1" />
														{t('Verify GPU attestation by yourself')}
													</a>
													<a
														href="https://docs.nvidia.com/attestation/index.html#overview"
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center text-red-500 hover:text-red-600 text-xs transition-colors"
													>
														<ArrowTopRightOnSquareIcon className="w-3 h-3 mr-1" />
														{t('Learn about NVIDIA Attestation')}
													</a>
												</div>
											</div>

											{nvidiaPayload && (
												<div>
													<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
														{t('Nonce')}:
													</label>
													<div className="relative">
														<textarea
															readOnly
															className="w-full h-16 px-3 py-2 text-sm bg-gray-100 dark:bg-[rgba(248,248,248,0.04)] border border-gray-300 dark:border-[rgba(248,248,248,0.08)] rounded-md resize-none font-mono"
															value={nvidiaPayload?.nonce || ''}
														/>
														<button
															onClick={() => {
																if (!nvidiaPayload) return;
																handleCopy(nvidiaPayload.nonce, 'nonce');
															}}
															className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
															title="Copy nonce"
														>
															{checkedMap['nonce'] ? (
																<CheckIcon className="w-4 h-4" />
															) : (
																<ClipboardDocumentIcon className="w-4 h-4" />
															)}
														</button>
													</div>
												</div>
											)}

											{nvidiaPayload && (
												<div>
													<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
														{t('Evidence List')}:
													</label>
													<div className="relative">
														<textarea
															readOnly
															className="w-full h-32 px-3 py-2 text-sm bg-gray-100 dark:bg-[rgba(248,248,248,0.04)] border border-gray-300 dark:border-[rgba(248,248,248,0.08)] rounded-md resize-none font-mono"
															value={JSON.stringify(nvidiaPayload?.evidence_list || [], null, 2)}
														/>
														<button
															onClick={() => {
																if (!nvidiaPayload) return;
																handleCopy(
																	JSON.stringify(nvidiaPayload?.evidence_list || [], null, 2),
																	'evidence_list'
																);
															}}
															className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
															title="Copy evidence list"
														>
															{checkedMap['evidence_list'] ? (
																<CheckIcon className="w-4 h-4" />
															) : (
																<ClipboardDocumentIcon className="w-4 h-4" />
															)}
														</button>
													</div>
												</div>
											)}

											<div>
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
													{t('Architecture')}:
												</label>
												<div className="relative">
													<input
														type="text"
														readOnly
														value={nvidiaPayload?.arch || ''}
														className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-[rgba(248,248,248,0.04)] border border-gray-300 dark:border-[rgba(248,248,248,0.08)] rounded-md"
													/>
													<button
														onClick={() => {
															if (!nvidiaPayload) return;
															handleCopy(nvidiaPayload.arch, 'arch');
														}}
														className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
														title="Copy architecture"
													>
														{checkedMap['arch'] ? (
															<CheckIcon className="w-4 h-4" />
														) : (
															<ClipboardDocumentIcon className="w-4 h-4" />
														)}
													</button>
												</div>
											</div>
										</div>
									</div>
								)}
							</div>

							<div className="bg-gray-50 dark:bg-[rgba(0,236,151,0.08)] rounded-lg p-4">
								<button
									onClick={() => toggleSection('tdx')}
									className="w-full flex items-center justify-between text-left"
								>
									<div className="flex items-center space-x-3">
										<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
											<CheckIcon className="w-4 h-4 text-white" />
										</div>
										<span className="font-medium text-gray-900 dark:text-white">
											{t('TDX Attestation')}
										</span>
									</div>
									<ChevronDownIcon
										className={`w-5 h-5 text-gray-400 transform transition-transform ${
											expandedSections.tdx ? 'rotate-180' : ''
										}`}
									/>
								</button>

								{expandedSections.tdx && (
									<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
										<div className="space-y-4">
											{/* Intel Trust Domain Extensions Info */}
											<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
												<div className="flex items-center mb-2">
													<img src={IntelLogo} alt="Intel" className="w-16 h-8 mr-2" />
													<span className="text-sm font-medium text-green-900 dark:text-green-100">
														{t('Trust Domain Extensions')}
													</span>
												</div>
												<p className="text-xs text-green-800 dark:text-green-200 mb-3">
													{t(
														"Intel TDX (Trust Domain Extensions) provides hardware-based attestation for confidential computing. You can verify the authenticity of this TDX quote using Phala's TEE Attestation Explorer - an open source tool for analyzing Intel attestation reports."
													)}
												</p>
												<div className="space-y-1">
													<a
														href="https://proof.t16z.com/"
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center text-red-500 hover:text-red-600 text-xs transition-colors"
													>
														<ArrowTopRightOnSquareIcon className="w-3 h-3 mr-1" />
														{t('Verify TDX quote at TEE Explorer')}
													</a>
													<a
														href="https://www.intel.com/content/www/us/en/developer/articles/technical/intel-trust-domain-extensions.html"
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center text-red-500 hover:text-red-600 text-xs transition-colors"
													>
														<ArrowTopRightOnSquareIcon className="w-3 h-3 mr-1" />
														{t('Learn about Intel TDX')}
													</a>
												</div>
											</div>

											{/* Quote Section */}
											{intelQuote && (
												<div>
													<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
														{t('Quote')}:
													</label>
													<div className="relative">
														<textarea
															readOnly
															className="w-full h-32 px-3 py-2 text-sm bg-gray-100 dark:bg-[rgba(248,248,248,0.04)] border border-gray-300 dark:border-[rgba(248,248,248,0.08)] rounded-md resize-none font-mono"
															value={intelQuote}
														/>
														<button
															onClick={() => {
																if (!intelQuote) return;
																handleCopy(intelQuote, 'intelQuote');
															}}
															className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
															title="Copy quote"
														>
															{checkedMap['intelQuote'] ? (
																<CheckIcon className="w-4 h-4" />
															) : (
																<ClipboardDocumentIcon className="w-4 h-4" />
															)}
														</button>
													</div>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{attestationData && (
						<div className="mt-6 flex justify-center">
							<button
								onClick={verifyAgain}
								disabled={loading}
								className="disabled:opacity-45 disabled:cursor-not-allowed bg-gray-700/5 flex items-center gap-2 font-semibold hover:bg-gray-700/10 dark:bg-gray-750 dark:hover:bg-gray-100/10 dark:text-gray-300 dark:hover:text-white transition rounded-lg text-sm py-2.5 px-5"
							>
								<ArrowPathIcon className="w-5 h-5" />
								<span>{t('Verify Again')}</span>
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ModelVerifier;
