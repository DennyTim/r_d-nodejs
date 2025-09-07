import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
    JwtModule,
    JwtModuleOptions
} from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "../../services/auth.service";
import { JwtStrategy } from "../../services/jwt-strategy.service";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => {
                return Promise.resolve({
                    secret: configService.get<string>("JWT_SECRET"),
                    signOptions: { expiresIn: "1h" }
                });
            },
            inject: [ConfigService]
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy]
})
export class AuthModule {
}
