import type { ChatHistory, Message } from "@/types";

export const copyToClipboard = async (text: string): Promise<boolean> => {
  let result = false;
  if (!navigator.clipboard) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      const msg = successful ? "successful" : "unsuccessful";
      console.log(`Fallback: Copying text command was ${msg}`);
      result = true;
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
    }

    document.body.removeChild(textArea);
    return result;
  }

  result = await navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("Async: Copying to clipboard was successful!");
      return true;
    })
    .catch((error) => {
      console.error("Async: Could not copy text: ", error);
      return false;
    });

  return result;
};

export const validateJSON = (json: string): boolean => {
  try {
    const obj = JSON.parse(json);
    return obj && typeof obj === "object";
  } catch {
    return false;
  }
};

export const createMessagesList = (history: ChatHistory, messageId: string): Message[] => {
  if (messageId === null) {
    return [];
  }

  const message = history.messages[messageId];
  if (message?.parentId) {
    return [...createMessagesList(history, message.parentId), message];
  } else {
    return [message];
  }
};

export const formatFileSize = (size?: number) => {
  if (size == null || size === undefined) return "Unknown size";
  if (typeof size !== "number" || size < 0) return "Invalid size";
  if (size === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    //biome-ignore lint/style/noParameterAssign: explanation
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const getLineCount = (text: string) => {
  console.log(typeof text);
  return text ? text.split("\n").length : 0;
};
