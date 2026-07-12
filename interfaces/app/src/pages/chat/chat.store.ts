import { create } from "zustand";

export interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    model?: string;
    tokens?: number;
    costUsd?: number;
    createdAt: number;
}

export interface CascadeEvent {
    from: string;
    to: string;
    reason: string;
    at: number;
}

interface ChatState {
    conversationId: string | null;
    messages: Message[];
    cascadeEvents: CascadeEvent[];
    isStreaming: boolean;
    streamContent: string;
    currentModel: string;
    totalTokens: number;
    totalCost: number;
    selectedModel: string;
    cascadeEnabled: boolean;
    profile: string;
    abortController: AbortController | null;

    setConversationId: (id: string | null) => void;
    setSelectedModel: (m: string) => void;
    setCascadeEnabled: (v: boolean) => void;
    setProfile: (p: string) => void;
    addMessage: (msg: Omit<Message, "id" | "createdAt">) => void;
    startStream: (model: string) => AbortController;
    appendToken: (
        content: string,
        model: string,
        tokens: number,
        cost: number
    ) => void;
    addCascade: (evt: CascadeEvent) => void;
    finishStream: (totalTokens: number, totalCost: number) => void;
    cancelStream: () => void;
    clearConversation: () => void;
    newConversation: () => void;
}

let _msgId = 0;

export const useChatStore = create<ChatState>((set, get) => ({
    conversationId: null,
    messages: [],
    cascadeEvents: [],
    isStreaming: false,
    streamContent: "",
    currentModel: "",
    totalTokens: 0,
    totalCost: 0,
    selectedModel: "",
    cascadeEnabled: true,
    profile: "balanced",
    abortController: null,

    setConversationId: conversationId => set({ conversationId }),
    setSelectedModel: selectedModel => set({ selectedModel }),
    setCascadeEnabled: cascadeEnabled => set({ cascadeEnabled }),
    setProfile: profile => set({ profile }),

    addMessage: msg =>
        set(s => ({
            messages: [
                ...s.messages,
                { ...msg, id: String(++_msgId), createdAt: Date.now() }
            ]
        })),

    startStream: model => {
        const ctrl = new AbortController();
        set({
            isStreaming: true,
            streamContent: "",
            currentModel: model,
            abortController: ctrl
        });
        return ctrl;
    },

    appendToken: (content, model, tokens, cost) =>
        set(s => ({
            streamContent: s.streamContent + content,
            currentModel: model,
            totalTokens: s.totalTokens + tokens,
            totalCost: s.totalCost + cost
        })),

    addCascade: evt =>
        set(s => ({
            cascadeEvents: [...s.cascadeEvents, evt],
            currentModel: evt.to
        })),

    finishStream: (totalTokens, totalCost) => {
        const { streamContent, currentModel, messages } = get();
        const assistantMsg: Message = {
            id: String(++_msgId),
            role: "assistant",
            content: streamContent,
            model: currentModel,
            tokens: totalTokens,
            costUsd: totalCost,
            createdAt: Date.now()
        };
        set({
            isStreaming: false,
            streamContent: "",
            abortController: null,
            messages: [...messages, assistantMsg],
            totalTokens,
            totalCost
        });
    },

    cancelStream: () => {
        get().abortController?.abort();
        set({ isStreaming: false, streamContent: "", abortController: null });
    },

    clearConversation: () =>
        set({
            messages: [],
            cascadeEvents: [],
            totalTokens: 0,
            totalCost: 0,
            streamContent: ""
        }),

    newConversation: () =>
        set({
            conversationId: null,
            messages: [],
            cascadeEvents: [],
            totalTokens: 0,
            totalCost: 0,
            streamContent: "",
            isStreaming: false,
            abortController: null
        })
}));
