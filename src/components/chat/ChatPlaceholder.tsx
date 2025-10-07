import Bolt from "@heroicons/react/24/outline/BoltIcon";
import Fuse from "fuse.js";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import NearAIIcon from "@/assets/icons/near-icon-green.svg?react";
import SendMessageIcon from "@/assets/icons/send-message.svg?react";

import { allPrompts } from "@/pages/welcome/data";

interface Prompt {
  title: string[];
  content: string;
}

interface ChatPlaceholderProps {
  submitPrompt: (value: string) => void;
  submitVoice: (value: string) => void;
}

const ChatPlaceholder: React.FC<ChatPlaceholderProps> = ({ submitPrompt }) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);

  const handlePromptClick = (content: string) => {
    setInputValue(content);
  };
  const handleSubmit = (value: string) => {
    submitPrompt(value);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const enterPressed = e.key === "Enter" || e.keyCode === 13;
    if (enterPressed && inputValue) {
      submitPrompt(inputValue);
      setInputValue("");
    }
  };

  const getFilteredPrompts = useCallback(
    (inputValue: string) => {
      const sortedPrompts = [...(allPrompts ?? [])].sort(() => Math.random() - 0.5);
      if (inputValue.length > 500) {
        setFilteredPrompts([]);
      } else {
        const fuse = new Fuse(sortedPrompts, {
          keys: ["content", "title"],
          threshold: 0.5,
        });

        const newFilteredPrompts =
          inputValue.trim() && fuse ? fuse.search(inputValue.trim()).map((result) => result.item) : sortedPrompts;

        if (filteredPrompts.length !== newFilteredPrompts.length) {
          setFilteredPrompts(newFilteredPrompts);
        }
      }
    },
    [filteredPrompts]
  );

  useEffect(() => {
    getFilteredPrompts(inputValue);
  }, [inputValue, getFilteredPrompts]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="m-auto w-full max-w-6xl translate-y-6 px-2 py-24 text-center 2xl:px-20">
        <div className="flex w-full items-center gap-4 text-center font-primary text-3xl text-gray-800 dark:text-gray-100">
          <div className="flex w-full flex-col items-center justify-center">
            <div className="flex w-fit max-w-2xl flex-col items-center justify-center gap-3 px-2 pb-3 sm:gap-3.5">
              <h1 className="flex items-center gap-2 text-3xl text-white sm:text-3xl">
                <NearAIIcon className="h-6" /> AI
              </h1>
              <p className="text-base text-white dark:text-gray-300">
                Chat with your personal assistant without worrying about leaking private information.
              </p>
            </div>

            <div className="w-full py-3 font-normal text-base md:max-w-3xl">
              <div className="inset-x-0 mx-auto w-full px-2.5 font-primary dark:bg-gray-900">
                <div className="app-chat-input relative flex w-full flex-1 flex-col rounded-3xl border border-gray-50 bg-white/90 px-1 shadow-lg transition focus-within:border-gray-100 hover:border-gray-100 dark:border-gray-850 dark:bg-gray-400/5 dark:text-gray-100 hover:dark:border-gray-800 focus-within:dark:border-gray-800">
                  <div className="px-2.5">
                    <div className="scrollbar-hidden h-fit max-h-80 w-full resize-none overflow-auto bg-transparent px-1 pt-2.5 pb-[5px] outline-hidden ltr:text-left rtl:text-right dark:text-gray-100">
                      <textarea
                        className="scrollbar-hidden w-full resize-none bg-transparent px-1 pt-3 outline-hidden placeholder:text-gray-400"
                        placeholder="How can I help you today?"
                        rows={1}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    <div className="mx-0.5 mt-0.5 mb-2.5 flex max-w-full justify-between" dir="ltr">
                      <div className="ml-1 flex max-w-[80%] flex-1 items-center self-end" />

                      <div className="mr-1 flex shrink-0 space-x-1 self-end">
                        <div className="flex items-center">
                          <button
                            className={`${
                              !(inputValue === "")
                                ? "bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                                : "disabled bg-gray-200 text-white dark:bg-gray-700 dark:text-gray-900"
                            } self-center rounded-full p-1.5 transition`}
                            type="button"
                            onClick={() => handleSubmit(inputValue)}
                            aria-label="Send message"
                          >
                            <SendMessageIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="mx-auto mt-2 w-full max-w-2xl font-primary">
              <div className="mx-5">
                <div className="mb-1 flex items-center gap-1 font-medium text-gray-400 text-xs dark:text-gray-400">
                  <Bolt className="h-4 w-4" />
                  Suggested
                </div>
                <div className="h-40 w-full">
                  <div role="list" className="scrollbar-none max-h-40 items-start overflow-auto">
                    {filteredPrompts.map((prompt, idx) => (
                      <button
                        key={prompt.content}
                        role="listitem"
                        className="waterfall group flex w-full flex-1 shrink-0 flex-col justify-between rounded-xl bg-transparent px-3 py-2 font-normal text-base transition hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ animationDelay: `${idx * 60}ms` }}
                        onClick={() => handlePromptClick(prompt.content)}
                      >
                        <div className="flex flex-col text-left">
                          {prompt.title && prompt.title[0] !== "" ? (
                            <>
                              <div className="line-clamp-1 font-medium text-white transition dark:text-gray-300 dark:group-hover:text-gray-200">
                                {prompt.title[0]}
                              </div>
                              <div className="line-clamp-1 font-normal text-gray-400 text-xs dark:text-gray-400">
                                {prompt.title[1]}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="line-clamp-1 font-medium transition dark:text-gray-300 dark:group-hover:text-gray-200">
                                {prompt.content}
                              </div>
                              <div className="line-clamp-1 font-normal text-gray-600 text-xs dark:text-gray-400">
                                Prompt
                              </div>
                            </>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPlaceholder;
