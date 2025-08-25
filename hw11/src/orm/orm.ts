import { Pool } from "pg";
import SQL, { SQLStatement } from "sql-template-strings";

export class Orm<T extends { id: number }> {
    constructor(
        private readonly table: string,
        protected readonly pool: Pool
    ) {
    }

    async find(filters?: Partial<Omit<T, "id">>): Promise<T[]> {
        let query = SQL`SELECT *
                        FROM `.append(this.table);

        if (filters && Object.keys(filters).length > 0) {
            query = query.append(" WHERE ");
            const conditions: Array<SQLStatement | string> = [];

            Object.entries(filters).forEach(([key, value], index) => {
                if (value !== undefined) {
                    if (index > 0) {
                        conditions.push(" AND ");
                    }

                    conditions.push(
                        SQL``
                            .append(key)
                            .append(" = ")
                            .append(SQL`${value}`)
                    );
                }
            });

            conditions.forEach(condition => {
                query = query.append(condition);
            });
        }

        const client = await this.pool.connect();

        try {
            const result = await client.query(query);
            return result.rows as T[];
        } finally {
            client.release();
        }
    }

    async findOne(id: T["id"]): Promise<T | null> {
        const query = SQL`SELECT *
                          FROM `.append(this.table).append(SQL` WHERE id = ${id}`);

        const client = await this.pool.connect();

        try {
            const result = await client.query(query);

            return result.rows[0] as T || null;
        } finally {
            client.release();
        }
    }

    async save(entity: Omit<T, "id">): Promise<T> {
        const keys = Object.keys(entity);
        const values = Object.values(entity);

        let query = SQL`INSERT INTO `.append(this.table).append(" (");
        query = query.append(keys.join(", "));
        query = query.append(") VALUES (");

        values.forEach((value, index) => {
            if (index > 0) {
                query = query.append(", ");
            }

            query = query.append(SQL`${value}`);
        });

        query = query.append(") RETURNING *");

        const client = await this.pool.connect();

        try {
            const result = await client.query(query);

            return result.rows[0] as T;
        } finally {
            client.release();
        }
    }

    async update(id: T["id"], patch: Partial<Omit<T, "id">>): Promise<T> {
        const entries = Object
            .entries(patch)
            .filter(([, value]) => value !== undefined);

        if (entries.length === 0) {
            throw new Error("No fields to update");
        }

        let query = SQL`UPDATE `.append(this.table).append(" SET ");

        entries.forEach(([key, value], index) => {
            if (index > 0) {
                query = query.append(", ");
            }

            query = query
                .append(key)
                .append(" = ")
                .append(SQL`${value}`);
        });

        query = query.append(", update_at = CURRENT_TIMESTAMP");
        query = query.append(SQL` WHERE id = ${id} RETURNING *`);

        const client = await this.pool.connect();

        try {
            const result = await client.query(query);

            return result.rows[0] as T;
        } finally {
            client.release();
        }
    }

    async delete(id: T["id"]): Promise<void> {
        const query = SQL`DELETE
                          FROM `
            .append(this.table)
            .append(SQL` WHERE id = ${id}`);

        const client = await this.pool.connect();

        try {
            const result = await client.query(query);

            if (result.rowCount === 0) {
                throw new Error(`Entity with id ${id} not found`);
            }
        } finally {
            client.release();
        }
    }
}
