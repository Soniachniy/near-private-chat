import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/query-keys";
import type { Model } from "@/types";
import { modelsClient } from "../client";

type UseModelsOptions = Omit<UseQueryOptions<Model[], Error>, "queryKey" | "queryFn">;

export const useModels = (options?: UseModelsOptions) => {
  return useQuery({
    queryKey: queryKeys.models.all,
    queryFn: () => modelsClient.getModels(),
    staleTime: Infinity,
    ...options,
  });
};
