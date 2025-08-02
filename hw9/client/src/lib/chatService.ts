import {
    Observable,
    shareReplay,
    Subject
} from "rxjs";
import {
    io,
    Socket
} from "socket.io-client";
import {
    ChatDTO,
    MessageDTO,
    UserDTO
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";      // '' = origin
const WS_API = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

export class ChatService {
    private socket?: Socket;

    /** Multicast streams */
    private readonly message$ = new Subject<MessageDTO>();
    private readonly typing$ = new Subject<{ chatId: string; user: string; isTyping: boolean }>();
    private readonly chatCreated$ = new Subject<ChatDTO>();
    private readonly membersUpdated$ = new Subject<{ chatId: string; members: string[] }>();

    constructor(readonly userName: string) {
    }

    /* ------------------------------------------------------------------ */
    /*                       ---- REST over fetch ----                    */

    /* ------------------------------------------------------------------ */

    static async createUser(name: string, file?: File): Promise<UserDTO> {
        const fd = new FormData();
        fd.append("name", name);
        if (file) {
            fd.append("icon", file);
        }

        console.log({ icon: fd.get("icon") });

        return await ChatService.request<UserDTO>(
            "admin",
            "/api/users",
            {
                method: "POST",
                body: fd
            }
        );
    }

    /** GET /api/chats */
    async listChats(): Promise<ChatDTO[]> {
        const res = await this.request<{ items: ChatDTO[] }>("/api/chats");
        return res.items;
    }

    async listUsers(): Promise<UserDTO[]> {
        const res = await this.request<{ items: UserDTO[] }>(
            `/api/users`
        );
        return res.items;
    }

    /** GET /api/chats/:id/messages?cursor&limit=50 */
    async listMessages(chatId: string, cursor?: string): Promise<MessageDTO[]> {
        const res = await this.request<{ items: MessageDTO[] }>(
            `/api/chats/${chatId}/messages`,
            { params: { cursor, limit: 50 } }
        );
        return res.items;
    }

    /** GET /api/chats/:id/members */
    async updateMembers(chatId: string, add: string[] = [], remove: string[] = []) {
        await this.request<void>(
            `/api/chats/${chatId}/members`,
            {
                method: "PATCH",
                body: { add, remove }
            }
        );
    }

    /** POST /api/chats/:id/messages { text } */
    async sendMessage(chatId: string, text: string): Promise<void> {
        await this.request<void>(
            `/api/chats/${chatId}/messages`,
            { method: "POST", body: { text } }
        );
    }

    /** POST /api/chats { members, name? } */
    async createChat(members: string[], name?: string): Promise<ChatDTO> {
        return this.request<ChatDTO>(
            "/api/chats",
            { method: "POST", body: { members, name } }
        );
    }

    /* ------------------------------------------------------------------ */
    /*                  ---- WebSocket via socket.io ----                 */

    /* ------------------------------------------------------------------ */

    connectSocket() {
        if (this.socket) {
            return;
        }
        if (!this.userName) {
            throw new Error("Cannot connect to WebSocket without a user name");
        }
        const ws = io(WS_API, {
            path: "/ws",
            transports: ["websocket"],      // чистий WS
            auth: { user: this.userName },

            /* ---- reconnection options ---- */
            reconnection: true,
            reconnectionAttempts: Infinity, // безкінечно
            reconnectionDelay: 1000,       // старт: 1 с
            reconnectionDelayMax: 10000,    // макс: 10 с
            randomizationFactor: 0.5       // jitter 50 %
        });

        this.socket = ws;

        /* ① події з сервера → Subject */
        ws.on("message", (m: MessageDTO) => this.message$.next(m));
        ws.on("typing", (t) => this.typing$.next(t));
        ws.on("chatCreated", (c: ChatDTO) => this.chatCreated$.next(c));
        ws.on("membersUpdated", (u) => this.membersUpdated$.next(u));

        /* ② логіка reconnection */
        ws.on("reconnect", (_attempt) => {
            // після reconnection повертаємося в усі кімнати
            for (const chat of this.joinedChats) {
                ws.emit("join", { chatId: chat });
            }
        });

        ws.on("reconnect_error", (err) => console.warn("[ws] reconnect error", err));
        ws.on("error", (err) => console.error("[ws] error", err));
    }

    private readonly joinedChats = new Set<string>();

    joinChat(chatId: string) {
        this.joinedChats.add(chatId);
        this.socket?.emit("join", { chatId });
    }

    leaveChat(chatId: string) {
        this.joinedChats.delete(chatId);
        this.socket?.emit("leave", { chatId });
    }

    wsSend(chatId: string, text: string): void {
        this.socket?.emit("send", { chatId, text });
    }

    wsTyping(chatId: string, isTyping: boolean): void {
        this.socket?.emit("typing", { chatId, isTyping });
    }

    /* ------------------------------------------------------------------ */
    /*                         ---- Observables ----                      */

    /* ------------------------------------------------------------------ */

    onMessage(): Observable<MessageDTO> {
        return this.message$.pipe(shareReplay(1));
    }

    onTyping(): Observable<{ chatId: string; user: string; isTyping: boolean }> {
        return this.typing$.pipe(shareReplay(1));
    }

    onChatCreated() {
        return this.chatCreated$.asObservable();
    }

    onMembersUpdated() {
        return this.membersUpdated$.asObservable();
    }

    /* ------------------------------------------------------------------ */
    /*               ---- Shared low‑level fetch helper ----              */

    /* ------------------------------------------------------------------ */


    private async request<T>(
        path: string,
        opts: {
            method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
            body?: unknown;
            params?: Record<string, string | number | boolean | undefined>;
            /** Override / add headers if you need something extra */
            headers?: HeadersInit;
            /** Supply a custom AbortController for timeouts etc. */
            signal?: AbortSignal;
        } = {}
    ): Promise<T> {
        return ChatService.request<T>(this.userName, path, opts);
    }

    /**
     * Generic JSON fetcher that injects base URL, headers and query params.
     * Throws with a detailed message on non‑2xx responses.
     */
    static async request<T>(
        userName: string,
        path: string,
        opts: {
            method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
            body?: unknown;
            params?: Record<string, string | number | boolean | undefined>;
            /** Override / add headers if you need something extra */
            headers?: HeadersInit;
            /** Supply a custom AbortController for timeouts etc. */
            signal?: AbortSignal;
        } = {}
    ): Promise<T> {
        const url = new URL(`${API_BASE}${path}`, location.origin);
        if (opts.params) {
            Object.entries(opts.params).forEach(([k, v]) => {
                if (v !== undefined && v !== null) {
                    url.searchParams.append(k, String(v));
                }
            });
        }

        const isFD = opts.body instanceof FormData;

        const headers: HeadersInit = {
            ...(isFD ? {} : { "Content-Type": "application/json" }),
            "X-User": userName,
            ...opts.headers
        };

        const init: RequestInit = {
            method: opts.method ?? (opts.body ? "POST" : "GET"),
            headers,
            signal: opts.signal,
            body: isFD
                ? (opts.body as FormData)
                : opts.body
                    ? JSON.stringify(opts.body)
                    : undefined
        };

        const res = await fetch(url.toString(), init);

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`[${res.status}] ${res.statusText} – ${text}`);
        }

        if (res.status === 204) {
            return undefined as unknown as T;
        }

        const ct = res.headers.get("Content-Type") ?? "";
        if (!ct.includes("application/json")) {
            throw new Error(`Unexpected Content‑Type: ${ct}`);
        }

        return res.json() as Promise<T>;
    }
}
