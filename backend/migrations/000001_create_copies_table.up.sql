CREATE TABLE IF NOT EXISTS copies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    channel VARCHAR(50) NOT NULL,
    tone VARCHAR(50) NOT NULL,
    target VARCHAR(255) NOT NULL,
    likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT FALSE,
    product_name VARCHAR(255) NOT NULL,
    product_features TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;