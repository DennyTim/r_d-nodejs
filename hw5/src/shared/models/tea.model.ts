export interface TeaModel {
    id: number;
    name: string;
    origin: string;
    rating?: number;
    brewTemp?: number;
    notes?: string;
}

export interface PaginatedResponse {
    data: TeaModel[];
    total: number;
    page: number;
    pageSize: number;
}
