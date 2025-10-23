import { useEffect, useState } from "react";

import { useConfig } from "@/api/config/queries";
import { useModels } from "@/api/models/queries";
import { useChatStore } from "@/stores/useChatStore";

export const useAppInitialization = () => {
  const token = localStorage.getItem("token");

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: config, isLoading: isConfigLoading } = useConfig();

  // const { data: userData, isLoading: isUserLoading, error: userError } = useSessionUser({ enabled: !!token });

  const { data: models, isLoading: isModelsLoading } = useModels({
    enabled: !!token,
  });

  useEffect(() => {
    const initializeApp = async () => {
      if (isInitialized || isLoading) return;

      setIsLoading(true);

      try {
        const hash = window.location.hash.substring(1);
        if (hash) {
          const params = new URLSearchParams(hash);
          const oauthToken = params.get("token");
          if (oauthToken) {
            localStorage.setItem("token", oauthToken);
            window.history.replaceState(null, "", window.location.pathname);
          }
        }

        if (models) {
          // useUserStore.getState().setUser(userData);
          useChatStore.getState().setModels(models);
          const selectedDefaultModel = models.find((model) => model.id === "gpt-5-nano");
          useChatStore.getState().setSelectedModels([selectedDefaultModel?.id || models[0].id]);
          // console.log("User loaded:", userData);
        }

        // else if (userError) {
        //   console.error("Failed to load user data:", userError);

        //   localStorage.removeItem("token");
        //   useUserStore.getState().setUser(null);
        // }

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (config && (!token || models !== undefined)) {
      initializeApp();
    }
  }, [config, models, isInitialized, isLoading, token]);

  return {
    isInitialized,
    isLoading: isLoading || isConfigLoading || (token && isModelsLoading),
  };
};
