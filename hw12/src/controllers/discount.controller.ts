import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Param,
    Post
} from "@nestjs/common";
import { CreateDiscountRequest } from "../models/discount-request.model";
import { DiscountService } from "../services/discount.service";

@Controller("discounts")
export class DiscountController {
    constructor(private readonly discountService: DiscountService) {
    }

    @Post(":code")
    async createDiscount(
        @Param("code") code: string,
        @Body() body: CreateDiscountRequest
    ) {
        try {
            const discount = await this.discountService.createDiscount(code, body.percent);

            return {
                success: true,
                id: discount.code,
                percent: discount.percent
            };
        } catch (error) {
            if (error.message?.includes("already exists")) {
                throw new HttpException("Discount code already exists", HttpStatus.CONFLICT);
            }

            throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post("race/:code")
    async raceTest(
        @Param("code") code: string,
        @Body() body: CreateDiscountRequest
    ) {
        const promises = Array(5).fill(0).map(async (_, index) => {
            try {
                const result = await this.discountService.createDiscount(code, body.percent);

                return { success: true, result };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        try {
            const results = await Promise.allSettled(promises);
            const successful = results.filter(r =>
                r.status === "fulfilled" && r.value.success === true
            );
            const failed = results.filter(r =>
                r.status === "rejected" ||
                (r.status === "fulfilled" && r.value.success === false)
            );

            return {
                success: true,
                created: successful.length > 0,
                total_requests: 5,
                successful_requests: successful.length,
                failed_requests: failed.length
            };
        } catch (error) {
            console.error(`Race test error for ${code}:`, error.message);

            return {
                success: false,
                error: error.message
            };
        }
    }
}
