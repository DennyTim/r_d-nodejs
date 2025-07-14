// import { z } from "zod";
// import { Bootstrap } from "./core/bootstrap";
// import { Controller } from "./core/decorators/controller.decorator";
// import {
//     Get,
//     Post
// } from "./core/decorators/crud.decorator";
// import { Injectable } from "./core/decorators/injectable.decorator";
// import { Module } from "./core/decorators/module.decorator";
// import { Body } from "./core/decorators/param.decorator";
// import { UseFilter } from "./core/decorators/use-filter.decorator";
// import { UseGuards } from "./core/decorators/use-guard.decorator";
// import { UseInterceptor } from "./core/decorators/use-interceptor.decorator";
// import { UsePipes } from "./core/decorators/use-pipe.decorator";
// import { ExceptionFilter } from "./core/models/filter.model";
// import { CanActivate } from "./core/models/guard.model";
// import { Interceptor } from "./core/models/interceptor.model";
// import { ValidationPipe } from "./core/pipes/validation.pipe";
//
// // app/example.guard.ts
// class AuthGuard implements CanActivate {
//     canActivate(ctx: any) {
//         console.log("🔐 Guard check");
//         return true; // або false
//     }
// }
//
// // app/example.interceptor.ts
// class LoggerInterceptor implements Interceptor {
//     intercept(ctx: any, next: () => any) {
//         console.log(`📦 Intercepting ${ctx.method} ${ctx.path}`);
//         return next();
//     }
// }
//
// // app/example.filter.ts
// class ErrorLoggerFilter implements ExceptionFilter {
//     catch(exception: Error, context: any) {
//         console.error(`❌ Filtered error on ${context.method} ${context.path}:`, exception.message);
//     }
// }
//
// // app/zod-pipe.ts (можеш використати будь-яку Zod-схему)
// const createUserSchema = z.object({
//     username: z.string().min(3)
// });
//
// class CreateUserPipe extends ValidationPipe {
//     constructor() {
//         super(createUserSchema);
//     }
// }
//
// // app/services/user.service.ts
// @Injectable()
// class UserService {
//     getUsers() {
//         return ["Alice", "Bob"];
//     }
//
//     createUser(data: any) {
//         return { id: Date.now(), ...data };
//     }
// }
//
// // app/controllers/user.controller.ts
// @Controller("/users")
// class UserController {
//     constructor(private readonly userService: UserService) {
//     }
//
//     @Get()
//     @UseInterceptor(LoggerInterceptor)
//     getAll() {
//         return this.userService.getUsers();
//     }
//
//     @Post()
//     @UseGuards(AuthGuard)
//     @UsePipes(CreateUserPipe)
//     @UseFilter(ErrorLoggerFilter)
//     create(@Body() body: any) {
//         return this.userService.createUser(body);
//     }
// }
//
// // app/app.module.ts
// @Module({
//     providers: [UserService],
//     controllers: [UserController]
// })
// class AppModule {
// }
//
// // app/main.ts
// void Bootstrap(AppModule);
