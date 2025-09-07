import KeyvRedis from "@keyv/redis";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
    CacheableMemory,
    Keyv
} from "cacheable";
import { Post } from "./entities/post.entity";
import { User } from "./entities/user.entity";
import { AuthModule } from "./modules/auth/auth.module";
import { PostsModule } from "./modules/posts/posts.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: process.env.DB_HOST || "localhost",
            port: parseInt(process.env.DB_POSTGRES_PORT || "15432", 10),
            username: process.env.DB_USERNAME || "postgres",
            password: process.env.DB_PASSWORD || "password",
            database: process.env.DB_NAME || "social_network",
            entities: [User, Post],
            synchronize: process.env.NODE_ENV !== "production"
        }),
        CacheModule.registerAsync({
            useFactory: async () => {
                return Promise.resolve({
                    stores: [
                        new Keyv({
                            store: new CacheableMemory({
                                ttl: 60000,
                                lruSize: 5000
                            })
                        }),
                        new KeyvRedis(process.env.REDIS) // redis://localhost:6379
                    ]
                });
            }
        }),
        UsersModule,
        PostsModule,
        AuthModule
    ]
})
export class AppModule {
}
