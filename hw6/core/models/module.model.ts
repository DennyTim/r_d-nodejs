import { Token } from "./token.model";

export interface ModuleOptions {
    providers?: Token[];
    controllers?: Token[];
    imports?: Token[];
    exports?: Token[];
}
