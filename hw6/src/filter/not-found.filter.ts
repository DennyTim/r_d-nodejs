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
export class NotFoundFilter implements ExceptionFilter {
    catch(error: any, ctx: { req: Request; res: Response }) {
        if (error instanceof HttpException && error.status === 404) {
            const { req, res } = ctx;
            return res.status(404).json({
                error: error.message,
                url: req.originalUrl
            });
        }
    }
}
