import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query
} from "@nestjs/common";
import { DemoService } from "./demo.service";
import { CreateProductDto } from "./dto/product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./models/product.model";

@Controller("demo")
export class DemoController {
    constructor(private readonly demoService: DemoService) {
    }

    @Get()
    async runDemo() {
        try {
            const result = await this.demoService.runDemo();

            return {
                success: true,
                message: "Completed!",
                data: result
            };
        } catch ({ message }) {
            return {
                success: false,
                message: "Demo failed",
                error: message as string
            };
        }
    }

    @Get("products")
    async getProducts() {
        try {
            const products = await this.demoService.getAllProducts();

            return {
                success: true,
                count: products.length,
                data: products
            };
        } catch ({ message }) {
            return {
                success: false,
                message: "Failed to get products",
                error: message as string
            };
        }
    }

    @Post("products")
    async createProduct(@Body() createProductDto: CreateProductDto) {
        try {
            const payload = createProductDto as Omit<Product, "id">;
            const product = await this.demoService.createProduct(payload);
            return {
                success: true,
                message: "Product created successfully",
                data: product
            };
        } catch ({ message }) {
            return {
                success: false,
                message: "Failed to create product",
                error: message as string
            };
        }
    }

    @Get("products/:id")
    async getProduct(@Param("id", ParseIntPipe) id: number) {
        try {
            const product = await this.demoService.getProduct(id);

            if (!product) {
                return {
                    success: false,
                    message: `Product with ID ${id} not found`
                };
            }

            return {
                success: true,
                data: product
            };
        } catch ({ message }) {
            return {
                success: false,
                message: "Failed to get product",
                error: message as string
            };
        }
    }

    @Put("products/:id")
    async updateProduct(
        @Param("id", ParseIntPipe) id: number,
        @Body() updateProductDto: UpdateProductDto
    ) {
        try {
            const product = await this.demoService.updateProduct(id, updateProductDto);

            return {
                success: true,
                message: "Product updated successfully",
                data: product
            };
        } catch ({ message }) {
            return {
                success: false,
                message: "Failed to update product",
                error: message as string
            };
        }
    }

    @Get("products/category/:category")
    async getProductsByCategory(@Param("category") category: string) {
        try {
            const products = await this.demoService.getProductsByCategory(category);

            return {
                success: true,
                category,
                count: products.length,
                data: products
            };
        } catch ({ message }) {
            return {
                success: false,
                message: `Failed to get products by category: ${category}`,
                error: message as string
            };
        }
    }

    @Get("products/price-range")
    async getProductsByPriceRange(
        @Query("min", ParseIntPipe) minPrice: number,
        @Query("max", ParseIntPipe) maxPrice: number
    ) {
        try {
            const products = await this.demoService.getProductsByPriceRange(minPrice, maxPrice);

            return {
                success: true,
                priceRange: { min: minPrice, max: maxPrice },
                count: products.length,
                data: products
            };
        } catch ({ message }) {
            return {
                success: false,
                message: "Failed to get products by price range",
                error: message as string
            };
        }
    }

    @Delete("products/:id")
    async deleteProduct(@Param("id", ParseIntPipe) id: number) {
        try {
            await this.demoService.deleteProduct(id);

            return {
                success: true,
                message: `Product with ID ${id} deleted successfully`
            };
        } catch ({ message }) {
            return {
                success: false,
                message: "Failed to delete product",
                error: message as string
            };
        }
    }

    @Get("init")
    async initializeDatabase() {
        try {
            await this.demoService.initializeDatabase();

            return {
                success: true,
                message: "Database initialized successfully"
            };
        } catch ({ message }) {
            return {
                success: false,
                message: "Database initialization failed",
                error: message as string
            };
        }
    }
}
