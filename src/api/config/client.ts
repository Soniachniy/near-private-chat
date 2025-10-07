import { ApiClient } from "@/api/base-client";
import type { Config } from "@/types";

class ConfigClient extends ApiClient {
  constructor() {
    super({
      apiPrefix: "/api",
      defaultHeaders: {
        "Content-Type": "application/json",
      },
      includeAuth: false,
    });
  }

  async getConfig(): Promise<Config> {
    return this.get<Config>("/config");
  }
}

export const configClient = new ConfigClient();
