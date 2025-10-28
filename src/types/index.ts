import type { QueryClient } from "@tanstack/react-query";
import type { Conversation as OpenAIConversation } from "openai/resources/conversations/conversations";

import type {
  ResponseFunctionWebSearch,
  ResponseInputMessageItem,
  ResponseOutputMessage,
  ResponseReasoningItem,
  Tool,
} from "openai/resources/responses/responses.mjs";

export type OAuth2Provider = "google" | "github" | "microsoft" | "oidc";

export type UserRole = "user" | "admin" | "pending";

export interface User {
  api_key?: string;
  created_at: number;
  email: string;
  id: string;
  info?: unknown; //TODO
  last_active_at: number;
  name: string;
  oauth_sub?: string;
  profile_image_url?: string;
  role: UserRole;
  settings?: unknown; //TODO
  updated_at: number;
}

export interface ConversationInfo {
  id: string;
  created_at: number;
  updated_at: number;
  title: string;
  metadata: {
    title: string;
  };
}

export interface ConversationItemsResponse {
  data: (ResponseInputMessageItem | ResponseFunctionWebSearch | ResponseReasoningItem | ResponseOutputMessage)[];
  first_id: string;
  has_more: boolean;
  last_id: string;
  object: "list";
}

export interface Conversation extends OpenAIConversation {
  // ConversationItemsPage properties
  data?: (ResponseInputMessageItem | ResponseFunctionWebSearch | ResponseReasoningItem | ResponseOutputMessage)[];
  has_more?: boolean;
  last_id?: string;

  // Chat-specific properties
  user_id?: string;
  title?: string;
  chat?: {
    id: string;
    title: string;
    models: string[];
    params: object;
    history: {
      messages: Record<string, Message>;
      currentId: string | null;
    };
    files?: unknown[];
    messages: Message[];
    timestamp: number;
  };
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profile_image_url?: string;
  token: string;
  token_type: string; // Bearer
  expires_at: string | null;
  permissions: {
    workspace: {
      models: boolean;
      knowledge: boolean;
      prompts: boolean;
      tools: boolean;
    };
    sharing: {
      public_models: boolean;
      public_knowledge: boolean;
      public_prompts: boolean;
      public_tools: boolean;
    };
    chat: {
      controls: boolean;
      file_upload: boolean;
      delete: boolean;
      edit: boolean;
      stt: boolean;
      tts: boolean;
      call: boolean;
      multiple_models: boolean;
      temporary: boolean;
      temporary_enforced: boolean;
    };
    features: {
      direct_tool_servers: boolean;
      web_search: boolean;
      image_generation: boolean;
      code_interpreter: boolean;
    };
  };
}

export interface ChatInfo {
  id: string;
  content: string;
  title: string;
  created_at: number;
  updated_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  chat: {
    id: string;
    title: string;
    models: string[];
    params: object;
    history: {
      messages: Record<string, Message>;
      currentId: string;
    };
    messages: Message[];
    tags: string[];
    timestamp: number;
  };
  updated_at: number;
  created_at: number;
  share_id: string | null;
  archived: false;
  pinned: boolean;
  meta: object;
  folder_id: string | null;
}

export interface Message {
  id: string;
  parentId: string | null;
  childrenIds: string[];
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  models: string[];
  modelName?: string;
  chatCompletionId?: string;
  done?: boolean;
  model?: string;
  error?: boolean;
  sources?: unknown[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  statusHistory?: unknown[];
  modelIdx?: number;
  merged?: {
    timestamp: number;
    content: string;
    status: boolean;
  };
}

export interface ChatHistory {
  messages: Record<string, Message>;
  currentId: string | null;
}

// OpenAI API types
export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionStreamResponse {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: "assistant";
      content?: string;
    };
    finish_reason?: string;
  }>;
}

// Model types
export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  name: string;
  openai?: {
    id: string;
    object: string;
    created: number;
    owned_by: string;
  };
  urlIdx?: number;
  info?: {
    id: string;
    user_id: string;
    base_model_id: string | null;
    name: string;
    params: Record<string, unknown>;
    meta: {
      profile_image_url?: string;
      description?: string;
      capabilities?: {
        vision?: boolean;
      };
      [key: string]: unknown;
    };
  };
}

// Settings types
export interface Settings {
  theme: "light" | "dark" | "system";
  notificationEnabled: boolean;
  showChangelog: boolean;
  version: string;
  directConnections?: unknown;
  toolServers?: unknown[];
  // MessageInput specific settings
  imageCompression?: boolean;
  imageCompressionSize?: {
    width?: number;
    height?: number;
  };
  widescreenMode?: boolean;
  chatDirection?: "ltr" | "rtl" | "auto";
  richTextInput?: boolean;
  ctrlEnterToSend?: boolean;
  largeTextAsFile?: boolean;
  // System settings
  system?: string;
  requestFormat?: "json" | string | Record<string, unknown> | null;
  keepAlive?: string | number | null;
  params?: {
    stream_response?: boolean | null;
    function_calling?: string | null;
    seed?: number | null;
    temperature?: number | null;
    reasoning_effort?: string | null;
    logit_bias?: string | null;
    frequency_penalty?: number | null;
    presence_penalty?: number | null;
    repeat_penalty?: number | null;
    repeat_last_n?: number | null;
    mirostat?: number | null;
    mirostat_eta?: number | null;
    mirostat_tau?: number | null;
    top_k?: number | null;
    top_p?: number | null;
    min_p?: number | null;
    stop?: string | null;
    tfs_z?: number | null;
    num_ctx?: number | null;
    num_batch?: number | null;
    num_keep?: number | null;
    max_tokens?: number | null;
    use_mmap?: boolean | null;
    use_mlock?: boolean | null;
    num_thread?: number | null;
    num_gpu?: number | null;
  };
  chatBubble?: boolean;
}

// Config types
export interface Config {
  status?: boolean;
  name: string;
  version: string;
  default_locale?: string;
  oauth?: {
    providers?: {
      google?: boolean;
      microsoft?: boolean;
      github?: boolean;
      oidc?: boolean;
    };
  };
  features?: {
    auth?: boolean;
    auth_trusted_header?: boolean;
    enable_ldap?: boolean;
    enable_api_key?: boolean;
    enable_signup?: boolean;
    enable_login_form?: boolean;
    enable_websocket?: boolean;
  };
  onboarding?: boolean;
}

// Banner types
export interface Banner {
  id: string;
  type: "info" | "warning" | "error";
  content: string;
  dismissible: boolean;
}

// Folder types
export interface Folder {
  id: string;
  name: string;
  parent_id?: string;
  user_id: string;
  created_at: number;
  updated_at: number;
}

// Tag types
export interface Tag {
  name: string;
  count: number;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Store types
export interface UserStore {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
}

export interface ViewStore {
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
  isLeftSidebarOpen: boolean;
  setIsLeftSidebarOpen: (isOpen: boolean) => void;
  isRightSidebarOpen: boolean;
  setIsRightSidebarOpen: (isOpen: boolean) => void;
}

export interface ChatStore {
  chats: ChatInfo[];
  currentChat: Chat | null;
  isLoading: boolean;
  models: Model[];
  selectedModels: string[];

  setChats: (chats: ChatInfo[]) => void;
  setCurrentChat: (chat: Chat | null) => void;
  setModels: (models: Model[]) => void;

  addChat: (chat: ChatInfo) => void;
  updateChat: (id: string, chat: Partial<ChatInfo>) => void;
  deleteChat: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setSelectedModels: (models: string[]) => void;

  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, update: Partial<Message>) => void;
  appendToMessage: (messageId: string, content: string) => void;
}

export interface SettingsStore {
  settings: Settings;
  setSettings: (settings: Partial<Settings>) => void;
}

export interface ConfigStore {
  config: Config | null;
  setConfig: (config: Config) => void;
}

// Chat History types
export interface ChatHistory {
  messages: Record<string, Message>;
  currentId: string | null;
}

export interface HistoryMessage {
  done?: boolean;
}

export interface History {
  currentId?: string;
  messages?: Record<string, HistoryMessage>;
}

export interface StartStreamProps {
  model: string;
  role: "user" | "assistant";
  content: string | any[];
  conversation: string;
  queryClient: QueryClient;
  tools?: Tool[];
  include?: string[];
}
