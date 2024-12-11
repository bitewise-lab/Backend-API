CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    age DECIMAL(5, 2),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    weight DECIMAL(5, 2),
    height DECIMAL(5, 2),
    blood_sugar DECIMAL(5, 2),
    blood_pressure DECIMAL(5, 2),
    bmi DECIMAL(5, 2),
    health_condition VARCHAR(255),
    activity_level VARCHAR(255),
    imageUrl VARCHAR(3000)
);
