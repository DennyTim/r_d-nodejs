import {
    Module,
    Post
} from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostsService } from "../../services/posts.service";
import { PostsController } from "./posts.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Post])],
    controllers: [PostsController],
    providers: [PostsService]
})
export class PostsModule {
}
