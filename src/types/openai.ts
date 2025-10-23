import type { Message as MessageOpenAI } from "openai/resources/conversations/conversations";

export const extractMessageContent = (
  message: MessageOpenAI,
  type: "input_text" | "output_text" | "reasoning_text" = "input_text"
) => {
  return message.content.map((content) => (content.type === type ? content.text : "")).join("");
};

export const extractCitations = (message: MessageOpenAI) => {
  return message.content.filter((content) => content.type === "output_text").flatMap((content) => content.annotations);
};
