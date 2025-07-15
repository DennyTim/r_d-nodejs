import { ParamType } from "./param-type.model";
import { PipesType } from "./pipes-type.model";
import { Type } from "./type.model";

export interface ArgumentMetadata {
    readonly index: number;    // позиція аргументу у методі
    readonly type: ParamType;  // де “живе” значення
    readonly metatype?: Type;  // його TS-тип (якщо є)
    readonly data?: string;    // @Body('userId') → 'userId'
    readonly name?: string;    // ім'я функції-методу, якщо декоратор використовується на методі
    readonly pipe?: PipesType
}
