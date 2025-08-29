import {
    ConflictException,
    Injectable
} from "@nestjs/common";
import {
    DataSource,
    QueryFailedError
} from "typeorm";
import { Discount } from "../entities/discount.entity";

@Injectable()
export class DiscountService {
    constructor(private dataSource: DataSource) {
    }

    async createDiscount(code: string, percent: number, maxRetries = 3): Promise<Discount> {
        let retryCount = 0;

        while (retryCount <= maxRetries) {
            try {
                return await this.dataSource.transaction("SERIALIZABLE", async manager => {
                    const existing = await manager.findOne(Discount, { where: { code } });

                    if (existing) {
                        throw new ConflictException("Discount code already exists");
                    }

                    const discount = manager.create(Discount, { code, percent });
                    return await manager.save(discount);
                });
            } catch (error) {

                if (error instanceof QueryFailedError && error.message.includes("40001")) {
                    retryCount++;

                    console.log(`Serialization error, retry #${retryCount} after error 40001`);

                    if (retryCount <= maxRetries) {
                        const delay = 100 * Math.pow(2, retryCount - 1);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                }
                throw error;
            }
        }

        throw new Error("Max retries exceeded");
    }
}
