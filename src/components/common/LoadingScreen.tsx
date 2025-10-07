import type React from "react";
import Spinner from "./Spinner";

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex size-full flex-1 items-center justify-center">
      <Spinner className="size-10" />
    </div>
  );
};

export default LoadingScreen;
