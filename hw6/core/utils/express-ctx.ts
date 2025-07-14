import {
    Request,
    Response
} from "express";
import { ExecutionContext } from "../models";

export class ExpressExecutionContext implements ExecutionContext {
    constructor(
        private readonly targetClass: Function,
        private readonly targetHandler: Function,
        private readonly req: Request,
        private readonly res: Response
    ) {
    }

    getClass(): Function {
        return this.targetClass;
    }

    getHandler(): Function {
        return this.targetHandler;
    }

    switchToHttp() {
        return {
            getRequest: () => this.req,
            getResponse: () => this.res
        };
    }
}
