import { Token } from "../models";
import { Container } from "../utils";

export const Injectable = (): ClassDecorator => {
    return (target: Function) => {
        Container.register(target as Token, target);
    };
};
