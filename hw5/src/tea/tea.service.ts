import {
    HttpException,
    HttpStatus,
    Injectable
} from "@nestjs/common";
import { CreateTeaDto } from "../shared/dto/create-tea.dto";
import { GetAllTeaQueryDto } from "../shared/dto/get-all-query.dto";
import { UpdateTeaDto } from "../shared/dto/update-tea.dto";
import { TeaModel } from "../shared/models/tea.model";

@Injectable()
export class TeaService {
    #store = new Map<number, TeaModel>();

    public findAll(query: GetAllTeaQueryDto) {
        const { page = 1, limit = 10, minRating } = query;

        let teaList = [...this.#store.values()];

        if (minRating) {
            teaList = teaList.filter((tea) => {
                if (tea.rating) {
                    return tea.rating >= minRating;
                }

                return false;
            });
        }

        if (page && limit) {
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            teaList = teaList.slice(startIndex, endIndex);

            return {
                items: teaList,
                total: teaList.length,
                page,
                limit
            };
        }

        return teaList;
    }

    public findById(id: string) {
        const teaId = Number(id);

        if (isNaN(teaId)) {
            throw new HttpException("Incorrect id", HttpStatus.BAD_REQUEST);
        }

        const tea = this.#store.get(teaId) ?? null;

        if (!tea) {
            throw new HttpException("Not found", HttpStatus.NOT_FOUND);
        }

        return tea;
    }

    public create(dto: CreateTeaDto): TeaModel {
        const id = Date.now() * 24 * 60 * 60 * 1000;
        const tea = { id, ...dto };
        this.#store.set(id, tea);

        return tea;
    }

    public update(id: string, dto: UpdateTeaDto) {
        const teaId = Number(id);

        if (isNaN(teaId)) {
            throw new HttpException("Incorrect id", HttpStatus.BAD_REQUEST);
        }

        const tea = this.#store.get(teaId) ?? null;

        if (!tea) {
            throw new HttpException("Not found", HttpStatus.NOT_FOUND);
        }

        const updatedTea = {
            id: tea.id,
            name: dto.name ?? tea.name,
            origin: dto.origin ?? tea.origin,
            rating: dto.rating ?? tea.rating,
            brewTemp: dto.brewTemp ?? tea.brewTemp,
            notes: dto.notes ?? tea.notes
        };

        this.#store.set(tea.id, updatedTea);

        return updatedTea;
    }

    public delete(id: string) {
        const teaId = Number(id);

        if (isNaN(teaId)) {
            throw new HttpException("Incorrect id", HttpStatus.BAD_REQUEST);
        }

        const tea = this.#store.get(teaId) ?? null;

        if (!tea) {
            throw new HttpException("Not found", HttpStatus.NOT_FOUND);
        }

        return this.#store.delete(teaId);
    }
}
