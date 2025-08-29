import {
    Column,
    Entity,
    PrimaryColumn
} from "typeorm";

@Entity("discounts")
export class Discount {
    @PrimaryColumn("text")
    code: string;

    @Column("int")
    percent: number;
}
