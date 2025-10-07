import type React from "react";
import Spinner from "@/components/common/Spinner";

interface MessageSkeletonProps {
  message?: string;
}

const MessageSkeleton: React.FC<MessageSkeletonProps> = ({ message = "Encrypting & fetching messages ..." }) => {
  return (
    <div className="flex items-center gap-x-2 py-0.5 text-xs">
      <Spinner className="size-4 text-[#00EC97]" />
      <span className="shimmer text-base text-gray-500 dark:text-gray-500">{message}</span>
    </div>
  );
};

export default MessageSkeleton;
