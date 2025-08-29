import {
    Check,
    Column,
    Entity,
    PrimaryGeneratedColumn
} from "typeorm";

@Entity("accounts")
@Check("balance >= 0")
export class Account {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("numeric", { precision: 15, scale: 2 })
    balance: number;
}
