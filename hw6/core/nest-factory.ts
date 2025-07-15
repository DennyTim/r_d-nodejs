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
    static init(modules: any[]) {
        const app = this.createApp(modules);

        modules.forEach((item) => {
            const mod = item.module ?? item;
            const meta = Reflect.getMetadata(MODULE_METADATA, mod);
            const providers = item.providers ?? meta?.providers ?? [];

            if (!meta) {
                return;
            }

            this.registerModules(meta);
            this.registerProviders(providers);
        });

        return app;
    }

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
                const mod = item.module ?? item;
                const meta = Reflect.getMetadata(MODULE_METADATA, mod);

                if (!meta) {
                    return;
                }

                this.registerControllers(
                    meta,
                    router,
                    globalGuards,
                    globalPipes,
                    globalFilters,
                    globalInterceptors
                );
            });

            app.listen(port, callback);
        };

        app.use(router);

        return {
            get: (token: Token) => Container.resolve(token),
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

    private static registerControllers(
        meta: any,
        router: ReturnType<express.Router>,
        globalGuards: Type[],
        globalPipes: Type[],
        globalFilters: Type[],
        globalInterceptors: Type[]
    ) {
        (meta.controllers ?? []).forEach((ctrl: Token) => {
            Container.register(ctrl, ctrl);

            const prefix = Reflect.getMetadata(CTRL_PREFIX, ctrl) ?? "";
            const routes = Reflect.getMetadata(ROUTES_METADATA, ctrl) ?? [];
            const instance = Container.resolve(ctrl) as InstanceType<typeof ctrl>;

            routes.forEach((route: { method: Method; path: string; handlerName: string }) => {
                const { method, path, handlerName } = route;
                const handler = instance[handlerName] as Type<Promise<any>>;
                const fullPath = prefix + path;

                console.log(`Registering [${method.toUpperCase()}] ${fullPath} → ${handlerName}`);

                (router as express.Router)[method](
                    fullPath,
                    asyncHandler(GuardsMiddleware(ctrl, handler, globalGuards)),
                    asyncHandler(PipesMiddleware(instance, handler, globalPipes)),
                    asyncHandler(InterceptorsMiddleware(ctrl, handler, globalInterceptors)),
                    asyncHandler(FiltersMiddleware(ctrl, handler, globalFilters))
                );
            });
        });
    }

    private static registerModules(meta: any) {
        (meta.imports ?? []).forEach((importedModule: any) => {
            const importedMeta = Reflect.getMetadata(MODULE_METADATA, importedModule);

            (importedMeta?.providers ?? []).forEach((provider: any) => {
                Container.register(provider.provide ?? provider, provider.useValue ?? provider.useClass ?? provider);
            });

            (importedMeta?.exports ?? []).forEach((exported: any) => {
                Container.register(exported, exported);
            });
        });
    }

    private static registerProviders(providers: any[]) {
        providers.forEach((provider: any) => {
            if (typeof provider === "function") {
                Container.register(provider, provider);
            } else if (provider?.provide) {
                const value = provider.useValue ?? provider.useClass;
                if (!value) {
                    throw new Error(`No useValue/useClass for token ${String(provider.provide)}`);
                }
                Container.register(provider.provide, value);
            }
        });
    }
}
