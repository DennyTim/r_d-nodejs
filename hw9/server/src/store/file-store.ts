import { Injectable } from "@nestjs/common";
import { existsSync } from "fs";
import {
    mkdir,
    readFile,
    writeFile
} from "fs/promises";
import { join } from "path";
import {
    ChatDTO,
    MessageDTO,
    UserDTO
} from "../dto";

@Injectable()
export class FileStore {
    private dbPath = join(process.cwd(), "src", "db", "db.json");

    constructor() {
        void this.ensureDbFile();
    }

    public async readPayload<T>(): Promise<T> {
        const content = await readFile(this.dbPath, "utf-8");

        return JSON.parse(content) || {};
    }

    public async writePayload<T>(payload: T): Promise<void> {
        await writeFile(this.dbPath, JSON.stringify(payload, null, 2));
    }

    public async readUsers(): Promise<UserDTO[]> {
        const payload = await this.readPayload<{ users: UserDTO[] }>();

        return payload.users || [];
    }

    public async writeUsers(users: UserDTO[]) {
        const payload = await this.readPayload<Record<string, unknown>>();

        await this.writePayload<{ users: UserDTO[] }>({ ...payload, users });
    }

    public async readChats(): Promise<ChatDTO[]> {
        const payload = await this.readPayload<{ chats: ChatDTO[] }>();

        return payload.chats || [];
    }

    public async writeChats(chats: ChatDTO[]) {
        const payload = await this.readPayload<Record<string, unknown>>();

        await this.writePayload<{ chats: ChatDTO[] }>({ ...payload, chats });
    }

    public async readMessages(): Promise<MessageDTO[]> {
        const payload = await this.readPayload<{ messages: MessageDTO[] }>();

        return payload.messages || [];
    }

    public async writeMessages(messages: MessageDTO[]) {
        const payload = await this.readPayload<Record<string, unknown>>();

        await this.writePayload<{ messages: MessageDTO[] }>({ ...payload, messages });
    }

    private async ensureDbFile() {
        const dir = join(process.cwd(), "src", "db");
        if (!existsSync(dir)) {
            await mkdir(dir, { recursive: true });
        }
        if (!existsSync(this.dbPath)) {
            await writeFile(this.dbPath, JSON.stringify({ users: [] }, null, 2));
        }
    }
}
