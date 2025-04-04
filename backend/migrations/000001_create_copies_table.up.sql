CREATE TABLE copies (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    channel ENUM('app', 'line', 'pop', 'sns', 'email') NOT NULL,
    tone ENUM('pop', 'trust', 'value', 'luxury', 'casual') NOT NULL,
    target VARCHAR(255) NOT NULL,
    likes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN NOT NULL DEFAULT false,
    product_name VARCHAR(255) NOT NULL,
    product_features TEXT NOT NULL
);
