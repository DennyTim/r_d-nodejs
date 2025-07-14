import express from "express";
import {
    FiltersMiddleware,
    GuardsMiddleware,
    InterceptorsMiddleware,
    PipesMiddleware
} from "./middlewares";
import {
    CTRL_PREFIX,
    Method,
    MODULE_METADATA,
    ROUTES_METADATA,
    Token,
    Type
} from "./models";
import {
    asyncHandler,
    Container
} from "./utils";

export class NestFactory {
    static createApp(modules: any[]) {
        const app = express();

        app.use(express.json());

        const router = express.Router();
        const globalGuards: Array<Type> = [];
        const globalFilters: Array<Type> = [];
        const globalInterceptors: Array<Type> = [];
        const globalPipes: Array<Type> = [];

        const listen = (port: number, callback: () => void) => {
            modules.forEach((item) => {
                const meta = Reflect.getMetadata(MODULE_METADATA, item);

                if (!meta) {
                    return;
                }

                (meta.controllers ?? []).forEach((ctrl: Token) => {
                    Container.register(ctrl, ctrl);

                    const prefix = Reflect.getMetadata(CTRL_PREFIX, ctrl) ?? "";
                    const routes = Reflect.getMetadata(ROUTES_METADATA, ctrl) ?? [];
                    const instance = Container.resolve(ctrl) as InstanceType<typeof ctrl>;

                    routes.forEach((route: { method: Method; path: string; handlerName: string }) => {
                        const handler = instance[route.handlerName] as Type<Promise<any>>;
                        const path = prefix + route.path;

                        console.log(`Registering [${route.method.toUpperCase()}] ${path} → ${route.handlerName}`);


                        router[route.method](
                            path,
                            asyncHandler(GuardsMiddleware(ctrl, handler, globalGuards)),
                            asyncHandler(PipesMiddleware(instance, handler, globalPipes)),
                            asyncHandler(InterceptorsMiddleware(ctrl, handler, globalInterceptors)),
                            asyncHandler(FiltersMiddleware(ctrl, handler, globalFilters))
                        );
                    });
                });
            });

            app.listen(port, callback);
        };

        app.use(router);

        return {
            get: Container.resolve,
            listen,
            use: (path: string, handler: express.RequestHandler) => {
                app.use(path, handler);
            },
            useGlobalGuards: (guards: Array<Type>) => {
                globalGuards.push(...guards);
            },
            useGlobalPipes: (pipes: Array<Type>) => {
                globalPipes.push(...pipes);
            },
            useGlobalFilters: (filters: Array<Type>) => {
                globalFilters.push(...filters);
            },
            useGlobalInterceptors: (interceptors: any[]) => {
                globalInterceptors.push(...interceptors);
            }
        };
    }
}
