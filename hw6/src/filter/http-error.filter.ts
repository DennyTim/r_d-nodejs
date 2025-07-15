import {
    Request,
    Response
} from "express";
import {
    ExceptionFilter,
    Injectable
} from "../../core";
import { HttpException } from "../../core/exceptions/http.exception";

@Injectable()
export class HttpErrorFilter implements ExceptionFilter {
    catch(error: any, ctx: { req: Request; res: Response }) {
        const { res } = ctx;
        if (error instanceof HttpException) {
            return res
                .status(error.status)
                .json({ message: error.message });
        }
    }
}
