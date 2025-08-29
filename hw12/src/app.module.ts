import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DiscountController } from "./controllers/discount.controller";
import { TransferController } from "./controllers/transfer.controller";
import { Account } from "./entities/account.entity";
import { Discount } from "./entities/discount.entity";
import { Movement } from "./entities/movement.entity";
import { Post } from "./entities/post.entity";
import { DiscountService } from "./services/discount.service";
import { TransferService } from "./services/transfer.service";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: "localhost",
            port: parseInt(process.env.DB_POSTGRES_PORT || "15432", 10),
            username: process.env.DB_POSTGRES_USER,
            password: process.env.DB_POSTGRES_PASSWORD,
            database: process.env.DB_POSTGRES_DB,
            entities: [Account, Movement, Post, Discount],
            synchronize: true,
            logging: ["error"]
        }),
        TypeOrmModule.forFeature([
            Account,
            Movement,
            Post,
            Discount
        ])
    ],
    controllers: [
        TransferController,
        DiscountController
    ],
    providers: [
        TransferService,
        DiscountService
    ]
})
export class AppModule {
}
