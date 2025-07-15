import {
    Injectable,
    PipeTransform
} from "../../core";
import { HttpException } from "../../core/exceptions/http.exception";

@Injectable()
export class ParseIntPipe implements PipeTransform {
    transform(value: any) {
        console.log(value);

        if (value === undefined) {
            throw new HttpException(400, `Validation failed: '${value}' doesn't exist`);
        }

        const val = parseInt(value, 10);

        if (isNaN(val)) {
            throw new HttpException(400, `Validation failed: '${value}' is not a number`);
        }

        return val;
    }
}
