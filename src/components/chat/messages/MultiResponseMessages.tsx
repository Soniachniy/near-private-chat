import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { ChatHistory } from '@/types';
import ResponseMessage from './ResponseMessage';

interface MultiResponseMessagesProps {
	history: ChatHistory;
	messageId: string;
	isLastMessage: boolean;
	readOnly: boolean;
	webSearchEnabled: boolean;
	saveMessage: (messageId: string, content: string) => void;
	deleteMessage: (messageId: string) => void;
	regenerateResponse: () => void;
	mergeResponses: () => void;
}

const MultiResponseMessages: React.FC<MultiResponseMessagesProps> = ({
	history,
	messageId,
	isLastMessage,
	readOnly,
	webSearchEnabled,

	saveMessage,

	deleteMessage,

	regenerateResponse,
	mergeResponses
}) => {
	const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
	const [showMergeDialog, setShowMergeDialog] = useState(false);
	const [selectedResponses, setSelectedResponses] = useState<string[]>([]);

	const parentMessage = history.messages[messageId];
	const responses =
		parentMessage?.childrenIds?.map((id) => history.messages[id]).filter(Boolean) || [];

	useEffect(() => {
		if (responses.length > 0 && !currentMessageId) {
			setCurrentMessageId(responses[responses.length - 1].id);
		}
	}, [responses, currentMessageId]);

	const handleResponseSelect = (responseId: string) => {
		setCurrentMessageId(responseId);
	};

	const handleMerge = () => {
		if (selectedResponses.length < 2) {
			toast.error('Please select at least 2 responses to merge');
			return;
		}
		mergeResponses();
		setShowMergeDialog(false);
		setSelectedResponses([]);
	};

	const handleSelectResponse = (responseId: string) => {
		setSelectedResponses((prev) =>
			prev.includes(responseId) ? prev.filter((id) => id !== responseId) : [...prev, responseId]
		);
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString();
	};

	if (!parentMessage || responses.length === 0) return null;

	return (
		<div className="flex flex-col justify-between px-5 mb-3 w-full max-w-5xl mx-auto rounded-lg group">
			{/* Parent Message Header */}
			<div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
				<div className="flex items-center justify-between mb-2">
					<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
						Multiple Responses ({responses.length})
					</div>
					<div className="text-xs text-gray-500">{formatDate(parentMessage.timestamp)}</div>
				</div>
				<div className="text-sm text-gray-600 dark:text-gray-400">
					{String(parentMessage.content)}
				</div>
			</div>

			{/* Response Tabs */}
			<div className="flex space-x-1 mb-4 overflow-x-auto">
				{responses.map((response, index) => (
					<button
						key={response.id}
						onClick={() => handleResponseSelect(response.id)}
						className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
							currentMessageId === response.id
								? 'bg-blue-500 text-white'
								: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
						}`}
					>
						Response {index + 1}
						{response.modelName && (
							<span className="ml-1 text-xs opacity-75">({response.modelName})</span>
						)}
					</button>
				))}
			</div>

			{/* Current Response */}
			{currentMessageId && (
				<ResponseMessage
					history={history}
					messageId={currentMessageId}
					siblings={responses.map((r) => r.id)}
					isLastMessage={isLastMessage}
					readOnly={readOnly}
					webSearchEnabled={webSearchEnabled}
					saveMessage={saveMessage}
					deleteMessage={deleteMessage}
					regenerateResponse={regenerateResponse}
				/>
			)}

			{/* Multi-Response Actions */}
			{!readOnly && responses.length > 1 && (
				<div className="mt-4 flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<button
							onClick={() => setShowMergeDialog(true)}
							className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 flex items-center space-x-1"
						>
							<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
								/>
							</svg>
							<span>Merge Responses</span>
						</button>
					</div>
					<div className="text-xs text-gray-500">
						{responses.length} response{responses.length !== 1 ? 's' : ''} available
					</div>
				</div>
			)}

			{/* Merge Dialog */}
			{showMergeDialog && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
						<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
							Merge Responses
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
							Select the responses you want to merge:
						</p>
						<div className="space-y-2 mb-6">
							{responses.map((response, index) => (
								<label key={response.id} className="flex items-center space-x-2">
									<input
										type="checkbox"
										checked={selectedResponses.includes(response.id)}
										onChange={() => handleSelectResponse(response.id)}
										className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
									<span className="text-sm text-gray-700 dark:text-gray-300">
										Response {index + 1}
										{response.modelName && ` (${response.modelName})`}
									</span>
								</label>
							))}
						</div>
						<div className="flex space-x-3 justify-end">
							<button
								onClick={() => {
									setShowMergeDialog(false);
									setSelectedResponses([]);
								}}
								className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
							>
								Cancel
							</button>
							<button
								onClick={handleMerge}
								disabled={selectedResponses.length < 2}
								className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
							>
								Merge ({selectedResponses.length})
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MultiResponseMessages;
