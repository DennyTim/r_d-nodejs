import { INestApplication } from "@nestjs/common";
import {
    Test,
    TestingModule
} from "@nestjs/testing";
import * as request from "supertest";
import { DataSource } from "typeorm";
import { AppModule } from "../src/app.module";
import { Account } from "../src/entities/account.entity";
import { Movement } from "../src/entities/movement.entity";

describe("TransferController (e2e)", () => {
    let app: INestApplication;
    let dataSource: DataSource;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleFixture.createNestApplication();
        dataSource = moduleFixture.get<DataSource>(DataSource);

        await app.init();

        await dataSource.query("DELETE FROM movements");
        await dataSource.query("DELETE FROM accounts");
    });

    afterEach(async () => {
        await app.close();
    });

    describe("Atomic transfers", () => {
        it("should successfully transfer money between accounts", async () => {
            const fromAccount = await dataSource
                .getRepository(Account)
                .save({ balance: 1000 });

            const toAccount = await dataSource
                .getRepository(Account)
                .save({ balance: 500 });

            const response = await request(app.getHttpServer())
                .post("/transfer")
                .send({
                    fromId: fromAccount.id,
                    toId: toAccount.id,
                    amount: 200
                })
                .expect(201);

            expect(response.body).toHaveProperty("id");
            expect(response.body.amount).toBe(200);

            const updatedFromAccount = await dataSource
                .getRepository(Account)
                .findOne({ where: { id: fromAccount.id } });

            const updatedToAccount = await dataSource
                .getRepository(Account)
                .findOne({ where: { id: toAccount.id } });

            expect(Number(updatedFromAccount?.balance)).toBe(800);
            expect(Number(updatedToAccount?.balance)).toBe(700);

            const movementCount = await dataSource
                .getRepository(Movement)
                .count();

            expect(movementCount).toBe(1);
        });

        it("should fail when trying to overdraft and leave both tables empty", async () => {
            const fromAccount = await dataSource
                .getRepository(Account)
                .save({ balance: 100 });
            const toAccount = await dataSource
                .getRepository(Account)
                .save({ balance: 0 });

            const initialFromBalance = fromAccount.balance;
            const initialToBalance = toAccount.balance;

            await request(app.getHttpServer())
                .post("/transfer")
                .send({
                    fromId: fromAccount.id,
                    toId: toAccount.id,
                    amount: 200
                })
                .expect(400);

            const unchangedFromAccount = await dataSource
                .getRepository(Account)
                .findOne({ where: { id: fromAccount.id } });
            const unchangedToAccount = await dataSource
                .getRepository(Account)
                .findOne({ where: { id: toAccount.id } });

            expect(Number(unchangedFromAccount?.balance)).toBe(Number(initialFromBalance));
            expect(Number(unchangedToAccount?.balance)).toBe(Number(initialToBalance));

            const movementCount = await dataSource
                .getRepository(Movement)
                .count();

            expect(movementCount).toBe(0);
        });

        it("should fail on negative balance constraint", async () => {
            const fromAccount = await dataSource
                .getRepository(Account)
                .save({ balance: 100 });
            const toAccount = await dataSource
                .getRepository(Account)
                .save({ balance: 0 });

            await request(app.getHttpServer())
                .post("/transfer")
                .send({
                    fromId: fromAccount.id,
                    toId: toAccount.id,
                    amount: 200
                })
                .expect(400);

            const accountCount = await dataSource
                .getRepository(Account)
                .count();
            const movementCount = await dataSource
                .getRepository(Movement)
                .count();

            expect(accountCount).toBe(2);
            expect(movementCount).toBe(0);

            const fromBalance = await dataSource
                .getRepository(Account)
                .findOne({ where: { id: fromAccount.id } });

            expect(Number(fromBalance?.balance)).toBe(100);
        });
    });
});
