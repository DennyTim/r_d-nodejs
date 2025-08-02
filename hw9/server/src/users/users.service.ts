import {
    HttpException,
    HttpStatus,
    Injectable
} from "@nestjs/common";
import * as crypto from "crypto";
import * as fs from "fs/promises";
import * as path from "path";
import { UserDTO } from "../dto";
import { FileStore } from "../store/file-store";

@Injectable()
export class UsersService {
    private readonly iconsPath = path.join(process.cwd(), "public", "icons");

    constructor(private store: FileStore) {
        void this.ensureIconsDirectory();
    }

    private async ensureIconsDirectory(): Promise<void> {
        try {
            await fs.access(this.iconsPath);
        } catch {
            await fs.mkdir(this.iconsPath, { recursive: true });
        }
    }

    async createUser(
        name: string,
        iconFile?: Express.Multer.File
    ): Promise<UserDTO> {
        const userId = crypto.randomUUID();
        let iconUrl = "/api/users/default/picture";

        if (iconFile) {
            const iconFileName = `${name.toLowerCase()}-${userId}.png`;
            const iconPath = path.join(this.iconsPath, iconFileName);

            try {
                await fs.writeFile(iconPath, iconFile.buffer);
                iconUrl = `/api/users/icons/${iconFileName}`;
            } catch (error) {
                console.error(error);
                throw new HttpException("Something went wrong", HttpStatus.BAD_REQUEST);
            }
        }

        const user: UserDTO = {
            id: userId,
            name: name,
            iconUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const users = await this.store.readUsers();
        users.push(user);
        await this.store.writeUsers(users);

        return Promise.resolve(user);
    }

    async getPlaceholderIcon(): Promise<Buffer> {
        const detailedUserIconBase64 = `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`;
        return Buffer.from(detailedUserIconBase64, "base64");
    }

    async getIconByPath(iconPath: string): Promise<Buffer> {
        if (!iconPath.endsWith(".png") || iconPath.includes("..") || iconPath.includes("/") || iconPath.includes("\\")) {
            return this.getPlaceholderIcon();
        }

        const fullIconPath = path.join(this.iconsPath, iconPath);

        try {
            return await fs.readFile(fullIconPath);
        } catch {
            return this.getPlaceholderIcon();
        }
    }

    async getAll(): Promise<{ items: UserDTO[]; total: number }> {
        const payload = { items: [] as UserDTO[], total: 0 };
        try {
            const users = await this.store.readUsers();
            if (users.length) {
                payload.items = users;
                payload.total = users.length;
            }
        } catch (e) {
            console.error(`ERROR in [UsersService]: ${e}`);
            throw new HttpException("Something went wrong", HttpStatus.BAD_REQUEST);
        }
        return Promise.resolve(payload);
    }
}
