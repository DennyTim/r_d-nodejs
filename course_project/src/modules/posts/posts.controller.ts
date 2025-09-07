import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Request,
    UseGuards
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags
} from "@nestjs/swagger";
import { CreatePostDto } from "../../dto/create-post.dto";
import { JwtAuthGuard } from "../../guards/jwt-auth.guard";
import { PostsService } from "../../services/posts.service";

@ApiTags("posts")
@Controller("posts")
export class PostsController {
    constructor(private readonly postsService: PostsService) {
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Create a new post" })
    @ApiResponse({ status: 201, description: "Post created successfully" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    async create(@Body() createPostDto: CreatePostDto, @Request() req: { user: { id: number } }) {
        return this.postsService.create(createPostDto, req.user.id);
    }

    @Get()
    @ApiOperation({ summary: "Get posts by user ID" })
    @ApiQuery({ name: "userId", type: Number, description: "User ID to filter posts" })
    @ApiResponse({ status: 200, description: "Posts retrieved successfully" })
    @ApiResponse({ status: 403, description: "Missing required parameters" })
    async findByUserId(@Query("userId") userId: string) {
        if (!userId) {
            throw new Error("userId parameter is required");
        }

        return this.postsService.findByUserId(parseInt(userId))
    }
}
