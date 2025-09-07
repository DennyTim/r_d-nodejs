import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
    Inject,
    Injectable
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cache } from "cache-manager";
import { Repository } from "typeorm";
import { CreatePostDto } from "../dto/create-post.dto";
import { Post } from "../entities/post.entity";

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post)
        private postsRepository: Repository<Post>,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache
    ) {
    }

    async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
        const post = this.postsRepository.create({
            ...createPostDto,
            userId
        });

        const savedPost = await this.postsRepository.save(post);

        await this.cacheManager.del(`posts:user:${userId}`);

        return savedPost;
    }

    async findByUserId(userId: number): Promise<Post[]> {
        const cacheKey = `posts:user:${userId}`;

        const cachedPosts = await this.cacheManager.get<Post[]>(cacheKey);

        if (cachedPosts) {
            return cachedPosts;
        }

        const posts = await this.postsRepository.find({
            where: { userId },
            order: { createdAt: "DESC" }
        });

        await this.cacheManager.set(cacheKey, posts, 300_000);

        return posts;
    }
}
