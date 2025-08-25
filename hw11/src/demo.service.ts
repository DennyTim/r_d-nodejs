import {
    Injectable,
    Logger
} from "@nestjs/common";
import { initializeDb } from "./db/db";
import { DemoResult } from "./models/demo-result.model";
import { Product } from "./models/product.model";
import { ProductRepository } from "./repositories/product.repo";

@Injectable()
export class DemoService {
    private readonly logger = new Logger(DemoService.name);
    private readonly productRepo = new ProductRepository();

    async initializeDatabase(): Promise<void> {
        this.logger.log("Initializing database...");

        await initializeDb();

        this.logger.log("Database initialized successfully");
    }

    async runDemo(): Promise<DemoResult[]> {
        const results: DemoResult[] = [];

        try {
            await this.initializeDatabase();

            // 1. SAVE - Create new product
            this.logger.log('1️⃣ SAVE - Creating new product');
            const newProduct = await this.productRepo.save({
                name: "Laptop Gaming ASUS (Demo)",
                description: "High performance gaming laptop with RTX 4070",
                price: 1299.99,
                category: "Electronics"
            } as Omit<Product, "id">);

            results.push({
                step: "1",
                action: "SAVE",
                result: {
                    id: newProduct.id,
                    name: newProduct.name,
                    price: newProduct.category,
                    category: newProduct.category
                },
                timestamp: new Date().toISOString()
            });

            // 2. FIND - Get all products
            this.logger.log('2️⃣ FIND - Getting all products');
            const allProducts = await this.productRepo.find();

            results.push({
                step: "2",
                action: "FIND_ALL",
                result: {
                    count: allProducts.length,
                    products: allProducts.map(product => ({ id: product.id, name: product.name, price: product.price }))
                },
                timestamp: new Date().toISOString()
            });

            const secondProduct = await this.productRepo.save({
                name: "iPhone 15 Pro (Demo)",
                description: "Latest iPhone with A17 Pro chip",
                price: 999.99,
                category: "Electronics"
            } as Omit<Product, "id">);

            this.logger.log('2️⃣ FIND - Getting products by category');
            const electronicsProducts = await this.productRepo.find({ category: "Electronics" });

            results.push({
                step: "2b",
                action: "FIND_BY_CATEGORY",
                result: {
                    category: "Electronics",
                    count: electronicsProducts.length,
                    products: electronicsProducts.map(p => ({ id: p.id, name: p.name }))
                },
                timestamp: new Date().toISOString()
            });

            // 3. UPDATE - Update first product
            this.logger.log('3️⃣ UPDATE - Updating product');
            const updatedProduct = await this.productRepo.update(newProduct.id, {
                price: 1199.99,
                description: "High performance gaming laptop with RTX 4070 - SALE!"
            });

            results.push({
                step: "3",
                action: "UPDATE",
                result: {
                    id: updatedProduct.id,
                    name: updatedProduct.name,
                    old_price: 1299.99,
                    new_price: updatedProduct.price,
                    description: updatedProduct.description
                },
                timestamp: new Date().toISOString()
            });

            // 4. DELETE - Delete product
            this.logger.log('4️⃣ DELETE - Deleting product');
            await this.productRepo.delete(newProduct.id);

            results.push({
                step: "4",
                action: "DELETE",
                result: {
                    deleted_id: newProduct.id,
                    deleted_name: newProduct.name
                },
                timestamp: new Date().toISOString()
            });

            // 5. FIND_ONE - Try to find deleted product
            this.logger.log('5️⃣ FIND_ONE - Searching for deleted product');
            const deletedProduct = await this.productRepo.findOne(newProduct.id);

            results.push({
                step: "5",
                action: "FIND_ONE",
                result: {
                    searched_id: newProduct.id,
                    found: deletedProduct,
                    message: deletedProduct ? "Product found" : "Product not found (as expected)"
                },
                timestamp: new Date().toISOString()
            });

            const electronicsOnly = await this.productRepo.findByCategory("Electronics");
            const affordableProducts = await this.productRepo.findByPriceRange(500, 1000);

            results.push({
                step: "bonus",
                action: "SPECIALIZED_METHODS",
                result: {
                    electronics_count: electronicsOnly.length,
                    affordable_products_count: affordableProducts.length,
                    price_range: { min: 500, max: 1000 }
                },
                timestamp: new Date().toISOString()
            });

            if (secondProduct) {
                await this.productRepo.delete(secondProduct.id);
            }

            return results;
        } catch (error) {
            this.logger.error("Demo failed:", error);

            throw error;
        }
    }

    async getAllProducts(): Promise<Product[]> {
        try {
            return await this.productRepo.find();
        } catch (error) {
            this.logger.error("Failed to get products:", error);

            throw error;
        }
    }

    async getProductsByCategory(category: string): Promise<Product[]> {
        return await this.productRepo.findByCategory(category);
    }

    async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
        return await this.productRepo.findByPriceRange(minPrice, maxPrice);
    }

    async createProduct(productData: Omit<Product, "id">): Promise<Product> {
        return await this.productRepo.save(productData);
    }

    async updateProduct(id: number, updates: Partial<Omit<Product, "id">>): Promise<Product> {
        return await this.productRepo.update(id, updates);
    }

    async deleteProduct(id: number): Promise<void> {
        return await this.productRepo.delete(id);
    }

    async getProduct(id: number): Promise<Product | null> {
        return await this.productRepo.findOne(id);
    }
}
