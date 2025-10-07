import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDate } from "@/lib/time";
import type { ChatHistory, Message } from "@/types";
import ResponseMessage from "./ResponseMessage";

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
  showPreviousMessage: (message: Message) => void;
  showNextMessage: (message: Message) => void;
}

const MultiResponseMessages: React.FC<MultiResponseMessagesProps> = ({
  history,
  messageId,
  isLastMessage,
  readOnly,
  webSearchEnabled,
  showPreviousMessage,
  showNextMessage,
  saveMessage,

  deleteMessage,

  regenerateResponse,
  mergeResponses,
}) => {
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [selectedResponses, setSelectedResponses] = useState<string[]>([]);

  const parentMessage = history.messages[messageId];
  const responses = parentMessage?.childrenIds?.map((id) => history.messages[id]).filter(Boolean) || [];

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
      toast.error("Please select at least 2 responses to merge");
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

  if (!parentMessage || responses.length === 0) return null;

  return (
    <div className="group mx-auto mb-3 flex w-full max-w-5xl flex-col justify-between rounded-lg px-5">
      {/* Parent Message Header */}
      <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-medium text-gray-900 text-sm dark:text-gray-100">
            Multiple Responses ({responses.length})
          </div>
          <div className="text-gray-500 text-xs">{formatDate(parentMessage.timestamp * 1000)}</div>
        </div>
        <div className="text-gray-600 text-sm dark:text-gray-400">{String(parentMessage.content)}</div>
      </div>

      {/* Response Tabs */}
      <div className="mb-4 flex space-x-1 overflow-x-auto">
        {responses.map((response, index) => (
          <button
            key={response.id}
            onClick={() => handleResponseSelect(response.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
              currentMessageId === response.id
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Response {index + 1}
            {response.modelName && <span className="ml-1 text-xs opacity-75">({response.modelName})</span>}
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
          showPreviousMessage={showPreviousMessage}
          showNextMessage={showNextMessage}
        />
      )}

      {/* Multi-Response Actions */}
      {!readOnly && responses.length > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMergeDialog(true)}
              className="flex items-center space-x-1 rounded bg-green-500 px-3 py-1 text-white text-xs hover:bg-green-600"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="text-gray-500 text-xs">
            {responses.length} response{responses.length !== 1 ? "s" : ""} available
          </div>
        </div>
      )}

      {/* Merge Dialog */}
      {showMergeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 font-medium text-gray-900 text-lg dark:text-gray-100">Merge Responses</h3>
            <p className="mb-4 text-gray-600 text-sm dark:text-gray-400">Select the responses you want to merge:</p>
            <div className="mb-6 space-y-2">
              {responses.map((response, index) => (
                <label key={response.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedResponses.includes(response.id)}
                    onChange={() => handleSelectResponse(response.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 text-sm dark:text-gray-300">
                    Response {index + 1}
                    {response.modelName && ` (${response.modelName})`}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowMergeDialog(false);
                  setSelectedResponses([]);
                }}
                className="rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleMerge}
                disabled={selectedResponses.length < 2}
                className="rounded bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-400"
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
