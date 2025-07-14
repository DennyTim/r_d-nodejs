import { PipeTransform } from "./pipe.model";
import { Type } from "./type.model";

export type PipesType = Type<PipeTransform> | InstanceType<Type<PipeTransform>>;
