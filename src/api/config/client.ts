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
    return {
      status: true,
      name: "Near AI",
      version: "1.0.0",
      default_locale: "en",
      oauth: {
        providers: {
          google: false,
          microsoft: false,
          github: false,
          oidc: false,
        },
      },
      features: {
        auth: false,
        auth_trusted_header: false,
        enable_ldap: false,
        enable_api_key: false,
        enable_signup: false,
        enable_login_form: false,
        enable_websocket: false,
      },
      onboarding: false,
    };
    // try {
    //   return await this.get<Config>("/config");
    // } catch (error) {
    //   console.error(error);
    // }
  }
}

export const configClient = new ConfigClient();
