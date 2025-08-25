export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    category?: string;
    created_at: Date;
    updated_at: Date;
}
