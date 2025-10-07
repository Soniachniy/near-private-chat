import { ApiClient } from "@/api/base-client";
import type { Model } from "@/types";

class ModelsClient extends ApiClient {
  constructor() {
    super({
      apiPrefix: "/api",
      defaultHeaders: {
        "Content-Type": "application/json",
      },
      includeAuth: true,
    });
  }

  async getModels(): Promise<Model[]> {
    const response = await this.get<{ data: Model[] }>("/models");
    return response.data;
  }
}

export const modelsClient = new ModelsClient();
