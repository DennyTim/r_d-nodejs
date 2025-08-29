import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post
} from "@nestjs/common";
import { TransferRequest } from "../models/transfer-request.model";
import { TransferService } from "../services/transfer.service";

@Controller("transfer")
export class TransferController {
    constructor(private readonly transferService: TransferService) {
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async transfer(@Body() transferRequest: TransferRequest) {
        const movement = await this.transferService.transfer(
            transferRequest.fromId,
            transferRequest.toId,
            transferRequest.amount
        );

        return {
            id: movement.id,
            from_id: movement.from_id,
            to_id: movement.to_id,
            amount: movement.amount,
            created_at: movement.created_at
        };
    }
}
