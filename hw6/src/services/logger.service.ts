import { Injectable } from "../../core";

@Injectable()
export class LoggerService {
    log(message: string) {
        console.log("[LOGGER]", message);
    }
}
