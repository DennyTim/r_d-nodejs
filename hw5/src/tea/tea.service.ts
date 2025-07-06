import {
    HttpException,
    HttpStatus,
    Injectable
} from "@nestjs/common";
import { CreateTeaDto } from "../shared/dto/create-tea.dto";
import { GetAllTeaQueryDto } from "../shared/dto/get-all-query.dto";
import { UpdateTeaDto } from "../shared/dto/update-tea.dto";
import {
    PaginatedResponse,
    TeaModel
} from "../shared/models/tea.model";

@Injectable()
export class TeaService {
    #store = new Map<number, TeaModel>();

    public findAll(query: GetAllTeaQueryDto): Promise<PaginatedResponse> {
        const { page = 1, pageSize = 10, minRating = 0 } = query;

        const allTeas = [...this.#store.values()];
        const filtered = allTeas.filter(t => (t.rating ?? 0) >= minRating);

        const start = (page - 1) * pageSize;
        const data = filtered.slice(start, start + pageSize);

        return Promise.resolve({
            data: data,
            total: allTeas.length,
            page: page,
            pageSize: pageSize
        });
    }

    public async findById(id: string): Promise<TeaModel> {
        const teaId = Number(id);

        if (isNaN(teaId)) {
            throw new HttpException("Incorrect id", HttpStatus.BAD_REQUEST);
        }

        const tea = this.#store.get(teaId) ?? null;

        if (!tea) {
            throw new HttpException("Not found", HttpStatus.NOT_FOUND);
        }

        return Promise.resolve(tea);
    }

    public async create(dto: CreateTeaDto): Promise<TeaModel> {
        const id = Date.now() * 24 * 60 * 60 * 1000;
        const tea = { id, ...dto };
        this.#store.set(id, tea);

        return Promise.resolve(tea);
    }

    public async update(id: string, dto: UpdateTeaDto) {
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

        return Promise.resolve(updatedTea);
    }

    public async delete(id: string) {
        const teaId = Number(id);

        if (isNaN(teaId)) {
            throw new HttpException("Incorrect id", HttpStatus.BAD_REQUEST);
        }

        const tea = this.#store.get(teaId) ?? null;

        if (!tea) {
            throw new HttpException("Not found", HttpStatus.NOT_FOUND);
        }

        return Promise.resolve(this.#store.delete(teaId));
    }

    public clearMap() {
        this.#store.clear();

        console.log("Bye tea‑lovers 👋");
    }
}
