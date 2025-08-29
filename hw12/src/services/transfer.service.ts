import {
    BadRequestException,
    Injectable
} from "@nestjs/common";
import { DataSource } from "typeorm";
import { Account } from "../entities/account.entity";
import { Movement } from "../entities/movement.entity";

@Injectable()
export class TransferService {
    constructor(private dataSource: DataSource) {
    }

    async transfer(fromId: string, toId: string, amount: number): Promise<Movement> {
        if (amount <= 0) {
            throw new BadRequestException("Amount must be positive");
        }

        return await this.dataSource.transaction(async manager => {
            const [fromAccount, toAccount] = await Promise.all([
                manager.findOne(Account, {
                    where: { id: fromId },
                    lock: { mode: "pessimistic_write" }
                }),
                manager.findOne(Account, {
                    where: { id: toId },
                    lock: { mode: "pessimistic_write" }
                })
            ]);

            if (!fromAccount || !toAccount) {
                throw new BadRequestException("Account not found");
            }

            if (fromAccount.balance < amount) {
                throw new BadRequestException("Insufficient funds");
            }

            await manager.update(Account, fromId, { balance: () => `balance - ${amount}` });
            await manager.update(Account, toId, { balance: () => `balance + ${amount}` });

            const movement = manager.create(Movement, {
                from_id: fromId,
                to_id: toId,
                amount
            });

            return await manager.save(movement);
        });
    }
}
