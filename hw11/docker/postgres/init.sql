-- Creating products table
CREATE TABLE IF NOT EXISTS products
(
    id
    SERIAL
    PRIMARY
    KEY,
    name
    VARCHAR
(
    255
) NOT NULL,
    description TEXT,
    price DECIMAL
(
    10,
    2
) NOT NULL CHECK
(
    price
    >=
    0
),
    category VARCHAR
(
    100
),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- CREATE indexes for optimizing requests
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- INSERTING text data
INSERT INTO products (name, description, price, category)
VALUES ('MacBook Pro M3', 'Latest MacBook Pro with M3 chip', 1999.99, 'Electronics'),
       ('iPhone 15', 'Latest iPhone with USB-C', 799.99, 'Electronics'),
       ('Samsung Galaxy S24', 'Flagship Android smartphone', 899.99, 'Electronics'),
       ('Dell XPS 13', 'Premium ultrabook laptop', 1299.99, 'Electronics'),
       ('iPad Air', 'Lightweight tablet for work and play', 599.99, 'Electronics') ON CONFLICT DO NOTHING;

-- UPDATE fn for updated_at
CREATE
OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at
= CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- CREATE trigger for auto updating updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE
    ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
