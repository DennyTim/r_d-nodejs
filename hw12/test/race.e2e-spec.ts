import { INestApplication } from "@nestjs/common";
import {
    Test,
    TestingModule
} from "@nestjs/testing";
import * as request from "supertest";
import { DataSource } from "typeorm";
import { AppModule } from "../src/app.module";
import { Discount } from "../src/entities/discount.entity";

describe("Race Condition Tests", () => {
    let app: INestApplication;
    let dataSource: DataSource;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleFixture.createNestApplication();
        dataSource = moduleFixture.get<DataSource>(DataSource);
        await app.init();

        await dataSource.query("DELETE FROM discounts");
    });

    afterEach(async () => {
        await app.close();
    });

    describe("SERIALIZABLE isolation + retry logic", () => {
        it("should handle concurrent discount creation with SERIALIZABLE isolation", async () => {
            const discountCode = "SPRING30";
            const percent = 30;

            const promises = Array(5).fill(0).map((_, index) => {
                console.log(`Starting request ${index + 1} for ${discountCode}`);
                return request(app.getHttpServer())
                    .post(`/discounts/${discountCode}`)
                    .send({ percent })
                    .then(response => {
                        console.log(`Request ${index + 1} completed with status:`, response.status);
                        return response;
                    })
                    .catch(error => {
                        console.log(`Request ${index + 1} failed:`, error.message);
                        return error.response || { status: 500 };
                    });
            });

            const startTime = Date.now();
            const results = await Promise.allSettled(promises);
            const endTime = Date.now();
            const duration = endTime - startTime;

            console.log(`All requests completed in ${duration}ms`);

            expect(duration).toBeLessThan(3000);

            const successfulResults = results.filter(r =>
                r.status === "fulfilled" &&
                r.value.status === 201
            );

            const conflictResults = results.filter(r =>
                r.status === "fulfilled" &&
                r.value.status === 409
            );

            const failedResults = results.filter(r =>
                r.status === "rejected" ||
                (r.status === "fulfilled" && r.value.status >= 500)
            );

            console.log(`Successful requests: ${successfulResults.length}`);
            console.log(`Conflict requests: ${conflictResults.length}`);
            console.log(`Failed requests: ${failedResults.length}`);

            expect(successfulResults.length).toBeGreaterThan(0);
            expect(successfulResults.length + conflictResults.length).toBe(5);

            const discountCount = await dataSource
                .getRepository(Discount)
                .count({ where: { code: discountCode } });
            expect(discountCount).toBe(1);

            const discount = await dataSource
                .getRepository(Discount)
                .findOne({ where: { code: discountCode } });

            expect(discount).toBeDefined();
            expect(discount?.code).toBe(discountCode);
            expect(discount?.percent).toBe(percent);
        });

        it("should handle race condition with different discount codes", async () => {
            const discountCodes = ["SUMMER20", "WINTER25", "AUTUMN15"];

            const promises = discountCodes.map(async (code, index) => {
                try {
                    return await request(app.getHttpServer())
                        .post(`/discounts/${code}`)
                        .send({ percent: 20 + index * 5 });
                } catch (error) {
                    console.error(`Failed to create ${code}:`, error.message);

                    return {
                        status: error.response?.status || 500,
                        body: { error: error.message }
                    };
                }
            });

            const results = await Promise.all(promises);
            const successful = results.filter(r => r.status === 201);
            const conflicts = results.filter(r => r.status === 409);
            const serverErrors = results.filter(r => r.status >= 500);

            console.log(`Results: ${successful.length} success, ${conflicts.length} conflicts, ${serverErrors.length} errors`);

            results.forEach((response, index) => {
                console.log(`${discountCodes[index]}: status ${response.status}`);
            });

            expect(successful.length).toBeGreaterThanOrEqual(1);
            expect(serverErrors.length).toBeLessThanOrEqual(1);

            const totalDiscounts = await dataSource
                .getRepository(Discount)
                .count();

            expect(totalDiscounts).toBe(successful.length);
        });

        it("should demonstrate serialization error and retry", async () => {
            const discountCode = "RETRY_TEST";
            const percent = 50;

            const promises = Array(10).fill(0).map(() =>
                request(app.getHttpServer())
                    .post(`/discounts/${discountCode}`)
                    .send({ percent })
            );

            const startTime = Date.now();
            const results = await Promise.allSettled(promises);
            const endTime = Date.now();

            console.log(`Retry test completed in ${endTime - startTime}ms`);

            const discountCount = await dataSource
                .getRepository(Discount)
                .count({ where: { code: discountCode } });
            expect(discountCount).toBe(1);

            const successful = results.filter(r =>
                r.status === "fulfilled" &&
                (r.value as any).status === 201
            );

            const conflicts = results.filter(r =>
                r.status === "fulfilled" &&
                (r.value as any).status === 409
            );

            expect(successful.length).toBeGreaterThan(0);
            expect(successful.length + conflicts.length).toBeGreaterThanOrEqual(8); // Більшість запитів оброблено
        });
    });

    describe("Race endpoint test", () => {
        it("should handle race test endpoint", async () => {
            const discountCode = "RACE_ENDPOINT";

            const response = await request(app.getHttpServer())
                .post(`/discounts/race/${discountCode}`)
                .send({ percent: 40 })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.total_requests).toBe(5);
            expect(response.body.successful_requests).toBeGreaterThan(0);

            const discount = await dataSource
                .getRepository(Discount)
                .findOne({ where: { code: discountCode } });

            expect(discount).toBeDefined();
            expect(discount?.percent).toBe(40);
        });
    });
});
