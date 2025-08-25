import { pool } from "../db/db";
import { Product } from "../models/product.model";
import { Orm } from "../orm/orm";

export class ProductRepository extends Orm<Product> {
    constructor() {
        super("products", pool);
    }

    async findByCategory(category: string): Promise<Product[]> {
        return this.find({ category } as Partial<Omit<Product, "id">>);
    }

    async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
        const client = await this.pool.connect();

        try {
            const result = await client.query(
                "SELECT * FROM products WHERE price >= $1 AND price <= $2",
                [minPrice, maxPrice]
            );

            return result.rows as Product[];
        } finally {
            client.release();
        }
    }
}
