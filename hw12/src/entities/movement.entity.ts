import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { Account } from "./account.entity";

@Entity("movements")
export class Movement {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("uuid")
    from_id: string;

    @Column("uuid")
    to_id: string;

    @Column("numeric", { precision: 15, scale: 2 })
    amount: number;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Account)
    @JoinColumn({ name: "from_id" })
    fromAccount: Account;

    @ManyToOne(() => Account)
    @JoinColumn({ name: "to_id" })
    toAccount: Account;
}
