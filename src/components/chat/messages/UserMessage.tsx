import type { Message as MessageOpenAI } from "openai/resources/conversations/conversations";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import FileItem from "@/components/FileItem";
// import FileItem from "@/components/FileItem";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { extractFiles, extractMessageContent } from "@/types/openai";

interface UserMessageProps {
  message: MessageOpenAI;
  isFirstMessage: boolean;
  readOnly: boolean;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
}

const UserMessage: React.FC<UserMessageProps> = ({ message, readOnly, editMessage, deleteMessage }) => {
  const { settings } = useSettingsStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [edit, setEdit] = useState(false);
  const messageEditTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const messageContent = extractMessageContent(message);
  const messageFiles = extractFiles(message);
  const [editedContent, setEditedContent] = useState(messageContent || "");

  useEffect(() => {
    if (edit && messageEditTextAreaRef.current) {
      messageEditTextAreaRef.current.focus();
      messageEditTextAreaRef.current.select();
    }
  }, [edit]);

  const handleEdit = () => {
    setEdit(true);
    setEditedContent(messageContent || "");
  };
  const handleSave = () => {
    if (editedContent.trim() !== messageContent) {
      editMessage(message.id, editedContent.trim());
    }
    setEdit(false);
    setEditedContent("");
  };

  const handleCancel = () => {
    setEdit(false);
    setEditedContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSave();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleDelete = () => {
    deleteMessage(message.id);
    setShowDeleteConfirm(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  if (!message) return null;

  return (
    <div className="user-message group flex w-full" dir={settings.chatDirection || "ltr"} id={`message-${message.id}`}>
      <div className="w-0 max-w-full flex-auto pl-1">
        <div className={`chat-${message.role} markdown-prose w-full min-w-full`}>
          {messageFiles && messageFiles.length > 0 && (
            <div className="mt-2.5 mb-1 flex w-full flex-col flex-wrap justify-end gap-1 overflow-x-auto">
              {messageFiles.map((file) => (
                <div key={file.file_id} className={"self-end"}>
                  <FileItem file={file} />
                </div>
              ))}
            </div>
          )}

          {messageContent !== "" && (
            <>
              {edit ? (
                <div className="mb-2 w-full rounded-3xl bg-gray-50 px-5 py-3 dark:bg-gray-800">
                  <div className="max-h-96 overflow-auto">
                    <textarea
                      id={`message-edit-${message.id}`}
                      ref={messageEditTextAreaRef}
                      className="w-full resize-none bg-transparent outline-hidden"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      onInput={handleTextareaInput}
                      onKeyDown={handleKeyDown}
                    />
                  </div>

                  <div className="mt-2 mb-1 flex justify-between font-medium text-sm">
                    <div />
                    <div className="flex space-x-1.5">
                      <button
                        id="close-edit-message-button"
                        className="rounded-3xl bg-white px-4 py-2 text-gray-800 transition hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                      <button
                        id="confirm-edit-message-button"
                        className="rounded-3xl bg-gray-900 px-4 py-2 text-gray-100 transition hover:bg-gray-850 dark:bg-white dark:text-gray-800"
                        onClick={handleSave}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className={`flex justify-end pb-1`}>
                    <div className={`rounded-xl ${`max-w-[90%] bg-gray-50 px-4 py-2 dark:bg-gray-850`}`}>
                      {messageContent && <div className="whitespace-pre-wrap">{messageContent}</div>}
                    </div>
                  </div>

                  <div className={`flex justify-end text-gray-600 dark:text-gray-500`}>
                    {!readOnly && (
                      <button
                        className="edit-user-message-button invisible rounded-lg p-1.5 transition hover:bg-black/5 hover:text-black group-hover:visible dark:hover:bg-white/5 dark:hover:text-white"
                        onClick={handleEdit}
                        title="Edit"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2.3"
                          stroke="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                          />
                        </svg>
                      </button>
                    )}

                    <button
                      className="invisible rounded-lg p-1.5 transition hover:bg-black/5 hover:text-black group-hover:visible dark:hover:bg-white/5 dark:hover:text-white"
                      onClick={() => copyToClipboard(messageContent)}
                      title="Copy"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.3"
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                        />
                      </svg>
                    </button>

                    {/* {!readOnly && (!isFirstMessage || siblings.length > 1) && (
                      <button
                        className="invisible rounded-sm p-1 transition hover:text-black group-hover:visible dark:hover:text-white"
                        onClick={() => setShowDeleteConfirm(true)}
                        title="Delete"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                    )} */}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 font-medium text-gray-900 text-lg dark:text-gray-100">Delete Message</h3>
            <p className="mb-6 text-gray-600 text-sm dark:text-gray-400">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMessage;
