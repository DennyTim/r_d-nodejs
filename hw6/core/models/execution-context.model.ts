import {
    Request,
    Response
} from "express";

export interface ExecutionContext {
    getClass(): Function;
    getHandler(): Function;
    switchToHttp(): {
        getRequest: () => Request;
        getResponse: () => Response;
    };
}
