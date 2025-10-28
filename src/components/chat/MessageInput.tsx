import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { chatClient } from "@/api/chat/client";
import { useFiles } from "@/api/chat/queries/useFiles";
import SendMessageIcon from "@/assets/icons/send-message.svg?react";
import { compressImage } from "@/lib/image";
import { cn } from "@/lib/time";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useUserStore } from "@/stores/useUserStore";
import { useViewStore } from "@/stores/useViewStore";
import type { History, Message, Model } from "@/types";
import type { FileContentItem } from "@/types/openai";

interface MessageInputProps {
  messages?: Message[];
  transparentBackground?: boolean;
  onChange?: (data: {
    prompt: string;
    files: FileContentItem[];
    selectedToolIds: string[];
    imageGenerationEnabled: boolean;
    webSearchEnabled: boolean;
  }) => void;
  createMessagePair?: (prompt: string) => void;
  stopResponse?: () => void;
  autoScroll?: boolean;
  atSelectedModel?: Model;
  selectedModels?: string[];
  history?: History;
  taskIds?: string[] | null;
  prompt?: string;
  files?: FileContentItem[];
  toolServers?: Record<string, unknown>[];
  selectedToolIds?: string[];
  imageGenerationEnabled?: boolean;
  webSearchEnabled?: boolean;
  codeInterpreterEnabled?: boolean;
  placeholder?: string;
  onSubmit: (prompt: string, files: FileContentItem[], webSearchEnabled: boolean) => Promise<void>;
  onUpload?: (detail: Record<string, unknown>) => void;
  showUserProfile?: boolean;
  fullWidth?: boolean;
}

const PASTED_TEXT_CHARACTER_LIMIT = 50000;

const MessageInput: React.FC<MessageInputProps> = ({
  messages,
  transparentBackground = false,
  onChange = () => {},
  createMessagePair = () => {},
  stopResponse = () => {},
  autoScroll = false,
  atSelectedModel,
  selectedModels = [""],
  history,
  taskIds = null,
  prompt: initialPrompt = "",
  files: initialFiles = [],
  toolServers = [],
  selectedToolIds: initialSelectedToolIds = [],
  imageGenerationEnabled: initialImageGenerationEnabled = false,
  webSearchEnabled: initialWebSearchEnabled = false,
  placeholder = "",
  onSubmit,
  showUserProfile = true,
  fullWidth = true,
}) => {
  const { user } = useUserStore();
  const { settings } = useSettingsStore();
  const [loaded, setLoaded] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [dragged, setDragged] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [files, setFiles] = useState<FileContentItem[]>(initialFiles);
  const [selectedToolIds, setSelectedToolIds] = useState(initialSelectedToolIds);
  const [imageGenerationEnabled, setImageGenerationEnabled] = useState(initialImageGenerationEnabled);
  const [webSearchEnabled, setWebSearchEnabled] = useState(initialWebSearchEnabled);
  const { isLeftSidebarOpen, isMobile } = useViewStore();
  const filesInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const { data: filesData } = useFiles();
  console.log("filesData", filesData);
  const visionCapableModels = [...(atSelectedModel ? [atSelectedModel] : selectedModels)].filter(
    () => atSelectedModel?.info?.meta?.capabilities?.vision ?? true
  );

  useEffect(() => {
    onChange({
      prompt,
      files,
      selectedToolIds,
      imageGenerationEnabled,
      webSearchEnabled,
    });
  }, [prompt, files, selectedToolIds, imageGenerationEnabled, webSearchEnabled, onChange]);

  const uploadFileHandler = async (file: File): Promise<FileContentItem | undefined> => {
    try {
      const imageTypes = ["image/gif", "image/webp", "image/jpeg", "image/png", "image/avif"];
      const maxFileSize = 10 * 1024 * 1024; // 10MB

      if (file.size > maxFileSize) {
        toast.error(`File size should not exceed 10 MB.`);
        return;
      }

      if (imageTypes.includes(file.type)) {
        const imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        let finalImageUrl = imageUrl;
        if (settings.imageCompression) {
          const width = settings.imageCompressionSize?.width;
          const height = settings.imageCompressionSize?.height;
          if (width || height) {
            finalImageUrl = await compressImage(imageUrl, width, height);
          }
        }

        const newFile: FileContentItem = {
          type: "input_image",
          id: uuidv4(),
          name: file.name,
          image_url: finalImageUrl,
        };

        return newFile;
      }

      const data = await chatClient.uploadFile(file);

      const newFile: FileContentItem = file.type.startsWith("audio/")
        ? { type: "input_audio", id: data.id, name: data.filename }
        : { type: "input_file", id: data.id, name: data.filename };

      return newFile;
    } catch (error) {
      console.error("Error uploading file:", error);
      return undefined;
    }
  };

  const inputFilesHandler = async (inputFiles: File[]) => {
    for (const file of inputFiles) {
      const newFile = await uploadFileHandler(file);
      if (!newFile) continue;
      console.log("newFile", newFile);
      setFiles((prev) => [...prev, newFile]);
    }
  };

  useEffect(() => {
    setLoaded(true);
    const chatInput = document.getElementById("chat-input");
    setTimeout(() => chatInput?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDragged(false);
      }
    };

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types?.includes("Files")) {
        setDragged(true);
      } else {
        setDragged(false);
      }
    };

    const onDragLeave = () => {
      setDragged(false);
    };

    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.files) {
        const inputFiles = Array.from(e.dataTransfer.files);
        if (inputFiles && inputFiles.length > 0) {
          await inputFilesHandler(inputFiles);
        }
      }
      setDragged(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    const dropzoneElement = document.getElementById("chat-container");
    dropzoneElement?.addEventListener("dragover", onDragOver);
    dropzoneElement?.addEventListener("drop", onDrop);
    dropzoneElement?.addEventListener("dragleave", onDragLeave);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      dropzoneElement?.removeEventListener("dragover", onDragOver);
      dropzoneElement?.removeEventListener("drop", onDrop);
      dropzoneElement?.removeEventListener("dragleave", onDragLeave);
    };
  }, [inputFilesHandler]);

  const scrollToBottom = () => {
    const element = document.getElementById("messages-container");
    element?.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() || files.length > 0) {
      onSubmit(prompt, files, webSearchEnabled);
      setPrompt("");
      setFiles([]);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    const isCtrlPressed = e.ctrlKey || e.metaKey;

    if (e.key === "Escape") {
      stopResponse();
      setAtSelectedModel();
      setSelectedToolIds([]);
      setWebSearchEnabled(false);
      setImageGenerationEnabled(false);
    }

    if (isCtrlPressed && e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      createMessagePair(prompt);
    }

    if (prompt === "" && isCtrlPressed && e.key.toLowerCase() === "r") {
      e.preventDefault();
      const regenerateButton = document.querySelector(".regenerate-response-button") as HTMLElement;
      regenerateButton?.click();
    }

    if (prompt === "" && e.key === "ArrowUp") {
      e.preventDefault();
      const userMessageElement = document.querySelector(".user-message") as HTMLElement;
      if (userMessageElement) {
        userMessageElement.scrollIntoView({ block: "center" });
        const editButton = document.querySelector(".edit-user-message-button") as HTMLElement;
        editButton?.click();
      }
    }

    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      if (isComposing) return;

      const enterPressed =
        (settings.ctrlEnterToSend ?? false) ? e.key === "Enter" && isCtrlPressed : e.key === "Enter" && !e.shiftKey;

      if (enterPressed) {
        e.preventDefault();
        if (prompt !== "" || files.length > 0) {
          onSubmit(prompt, files, webSearchEnabled);
          setFiles([]);
          setPrompt("");
        }
      }
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData;

    if (clipboardData?.items) {
      for (const item of Array.from(clipboardData.items)) {
        if (item.type.indexOf("image") !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            await uploadFileHandler(blob);
          }
        } else if (item.type === "text/plain") {
          if (settings.largeTextAsFile ?? false) {
            const text = clipboardData.getData("text/plain");
            if (text.length > PASTED_TEXT_CHARACTER_LIMIT) {
              e.preventDefault();
              const blob = new Blob([text], { type: "text/plain" });
              const file = new File([blob], `Pasted_Text_${Date.now()}.txt`, {
                type: "text/plain",
              });
              await uploadFileHandler(file);
            }
          }
        }
      }
    }
  };

  async function deleteFileById(fileId: string): Promise<boolean> {
    try {
      await chatClient.deleteFile(fileId);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  const removeFile = async (fileId: string) => {
    deleteFileById(fileId);
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const setAtSelectedModel = () => {
    // This would be handled by parent component or store
  };

  if (!loaded) return null;

  return (
    <>
      {/* Files Overlay */}
      {dragged && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-gray-900 p-8 text-center dark:bg-gray-900">
            <div className="mb-4 text-4xl">📁</div>
            <div className="font-medium text-lg">Drop files here to upload</div>
          </div>
        </div>
      )}

      <div
        className={cn(
          `flex-row font-primary ${messages?.length === 0 ? "flex-1" : ""}`,
          fullWidth ? "w-full" : "w-full md:max-w-3xl"
        )}
      >
        <div className="inset-x-0 mx-auto flex justify-center bg-transparent">
          <div className={`flex flex-col px-3 ${settings.widescreenMode ? "max-w-full" : "max-w-6xl"} w-full`}>
            <div className="relative">
              {autoScroll === false && history?.currentId && (
                <div className="-top-12 pointer-events-none absolute right-0 left-0 z-30 flex justify-center">
                  <button
                    className="pointer-events-auto rounded-full border border-gray-100 bg-white p-1.5 dark:border-none dark:bg-white/20"
                    onClick={() => {
                      scrollToBottom();
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                      <path
                        fillRule="evenodd"
                        d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="relative w-full">
              {(atSelectedModel !== undefined || selectedToolIds.length > 0 || webSearchEnabled) && (
                <div className="absolute right-0 bottom-0 left-0 z-10 flex w-full flex-col bg-gradient-to-t from-white px-3 pt-1.5 pb-0.5 text-left dark:from-gray-900">
                  {atSelectedModel !== undefined && (
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2 pl-px text-sm dark:text-gray-500">
                        <img
                          crossOrigin="anonymous"
                          alt="model profile"
                          className="size-3.5 max-w-[28px] rounded-full object-cover"
                          src={
                            atSelectedModel?.info?.meta?.profile_image_url ??
                            `${window.location.pathname}/static/favicon.png`
                          }
                        />
                        <div className="translate-y-[0.5px]">
                          Talking to <span className="font-medium">{atSelectedModel.name}</span>
                        </div>
                      </div>
                      <div>
                        <button className="flex items-center dark:text-gray-500" onClick={() => setAtSelectedModel()}>
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={cn(
            transparentBackground ? "bg-transparent" : "bg-gray-900 dark:bg-gray-900",
            "flex flex-row items-center pb-4 md:pl-2.5"
          )}
        >
          {!isMobile && !isLeftSidebarOpen && showUserProfile && (
            <div>
              <button
                className="flex select-none rounded-xl p-1.5 transition hover:bg-gray-50 dark:hover:bg-gray-850"
                aria-label="User Menu"
              >
                <div className="self-center">
                  <img
                    src={user?.profile_image_url || "/user.png"}
                    className="size-7.5 rounded-full object-cover"
                    alt="User profile"
                    draggable="false"
                  />
                </div>
              </button>
            </div>
          )}
          <div
            className={`${
              settings.widescreenMode ? "max-w-full" : "max-w-6xl"
            }w-full inset-x-0 mx-auto flex-1 grow px-2.5`}
          >
            <div className="">
              <input
                ref={filesInputRef}
                type="file"
                hidden
                multiple
                onChange={async (e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const inputFiles = Array.from(e.target.files);
                    await inputFilesHandler(inputFiles);
                  } else {
                    toast.error("File not found.");
                  }
                  if (filesInputRef.current) {
                    filesInputRef.current.value = "";
                  }
                }}
              />

              <form className="flex w-full gap-1.5" onSubmit={handleSubmit}>
                <div
                  className="app-chat-input relative flex w-full flex-1 flex-col rounded-3xl border border-gray-50 bg-white/90 px-1 shadow-lg transition focus-within:border-gray-100 hover:border-gray-100 dark:border-gray-850 dark:bg-gray-400/5 dark:text-gray-100 hover:dark:border-gray-800 focus-within:dark:border-gray-800"
                  dir={settings.chatDirection ?? "auto"}
                >
                  {files.length > 0 && (
                    <div className="-mb-1 mx-2 mt-2.5 flex flex-wrap items-center gap-2">
                      {files.map((file) => (
                        <div key={file.id}>
                          {file.type === "input_image" ? (
                            <div className="group relative">
                              <div className="relative flex items-center">
                                <img src={file.image_url} alt="input" className="size-14 rounded-xl object-cover" />
                                {(atSelectedModel
                                  ? visionCapableModels.length === 0
                                  : selectedModels.length !== visionCapableModels.length) && (
                                  <div className="absolute top-1 left-1">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      className="size-4 fill-yellow-300"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="-top-1 -right-1 absolute">
                                <button
                                  className="invisible rounded-full border border-white bg-white text-black transition group-hover:visible"
                                  type="button"
                                  onClick={() => removeFile(file.id)}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="size-4"
                                  >
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-2 dark:bg-gray-800">
                              <div className="flex flex-1 items-center gap-2">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-sm">{file.type}</span>
                              </div>
                              <button onClick={() => removeFile(file.id)} className="text-gray-500 hover:text-red-500">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="px-2.5">
                    {(settings.richTextInput ?? true) ? (
                      <div
                        className="scrollbar-hidden h-fit max-h-80 w-full resize-none overflow-auto bg-transparent px-1 pt-3 text-left outline-hidden dark:text-gray-100"
                        id="chat-input-container"
                      >
                        <textarea
                          ref={chatInputRef}
                          id="chat-input"
                          className="min-h-[20px] w-full resize-none border-none bg-transparent text-base outline-none"
                          placeholder={placeholder || "Send a Message"}
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onPaste={handlePaste}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          rows={1}
                          style={{ lineHeight: "1.5" }}
                        />
                      </div>
                    ) : (
                      <textarea
                        id="chat-input"
                        dir="auto"
                        ref={chatInputRef}
                        className="scrollbar-hidden w-full resize-none bg-transparent px-1 pt-3 outline-hidden dark:text-gray-100"
                        placeholder={placeholder || "Send a Message"}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        rows={1}
                      />
                    )}
                  </div>

                  <div className="mx-0.5 mt-1 mb-2.5 flex max-w-full justify-between" dir="ltr">
                    <div className="ml-1 flex max-w-[80%] flex-1 items-center gap-0.5 self-end">
                      <div className="relative">
                        <button
                          className="rounded-full bg-transparent p-1.5 text-gray-800 outline-hidden transition hover:bg-gray-100 focus:outline-hidden dark:text-white dark:hover:bg-gray-800"
                          type="button"
                          aria-label="More"
                          onClick={() => {
                            filesInputRef.current?.click();
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="size-5"
                          >
                            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                          </svg>
                        </button>
                      </div>

                      <div className="scrollbar-none flex flex-1 items-center gap-1 overflow-x-auto">
                        {toolServers.length + selectedToolIds.length > 0 && (
                          <button
                            className="flex translate-y-[0.5px] items-center gap-1 self-center rounded-lg p-1 text-gray-600 transition hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
                            aria-label="Available Tools"
                            type="button"
                            onClick={() => setShowTools(!showTools)}
                          >
                            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.75}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.75}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="font-medium text-gray-600 text-sm dark:text-gray-300">
                              {toolServers.length + selectedToolIds.length}
                            </span>
                          </button>
                        )}

                        <>
                          <button
                            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                            type="button"
                            className={`flex max-w-full items-center gap-1.5 overflow-hidden rounded-full border px-1 py-0.5 font-medium text-xs transition-colors duration-300 focus:outline-hidden ${
                              webSearchEnabled
                                ? "border-blue-400/20 bg-blue-100 text-blue-500 dark:bg-blue-500/20"
                                : "border-transparent bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            }`}
                          >
                            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.75}
                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                              />
                            </svg>
                            <span className="hidden translate-y-[0.5px] overflow-hidden text-ellipsis whitespace-nowrap xl:block">
                              Web Search
                            </span>
                          </button>
                        </>
                      </div>
                    </div>

                    <div className="mr-1 flex shrink-0 space-x-1 self-end">
                      {(taskIds && taskIds.length > 0) ||
                      (history?.currentId && history.messages?.[history.currentId]?.done !== true) ? (
                        <button
                          className="rounded-full bg-white p-1.5 text-gray-800 transition hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-800"
                          onClick={stopResponse}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm6-2.438c0-.724.588-1.312 1.313-1.312h4.874c.725 0 1.313.588 1.313 1.313v4.874c0 .725-.588 1.313-1.313 1.313H9.564a1.312 1.312 0 01-1.313-1.313V9.564z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      ) : (
                        <button
                          id="send-message-button"
                          className={`${
                            !(prompt === "" && files.length === 0)
                              ? "bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                              : "disabled bg-gray-200 text-white dark:bg-gray-700 dark:text-gray-900"
                          } self-center rounded-full p-1.5 transition`}
                          type="submit"
                          disabled={prompt === "" && files.length === 0}
                        >
                          <SendMessageIcon className="size-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageInput;
