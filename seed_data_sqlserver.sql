/*
  ==========================================
  AutoHub - FULL SQL SERVER INIT SCRIPT
  ==========================================
  Includes:
  1) Create database
  2) Create tables + FK
  3) Insert sample data

  Paste all into SSMS and run.
*/

-- 1) CREATE DATABASE
IF DB_ID(N'rentacar') IS NULL
BEGIN
    CREATE DATABASE rentacar;
END;
GO

USE rentacar;
GO

SET NOCOUNT ON;
GO

/* 2) DROP OLD TABLES (safe rerun) */
IF OBJECT_ID('dbo.invoices', 'U') IS NOT NULL DROP TABLE dbo.invoices;
IF OBJECT_ID('dbo.rentals', 'U') IS NOT NULL DROP TABLE dbo.rentals;
IF OBJECT_ID('dbo.corporate_customers', 'U') IS NOT NULL DROP TABLE dbo.corporate_customers;
IF OBJECT_ID('dbo.customers', 'U') IS NOT NULL DROP TABLE dbo.customers;
IF OBJECT_ID('dbo.cars', 'U') IS NOT NULL DROP TABLE dbo.cars;
IF OBJECT_ID('dbo.models', 'U') IS NOT NULL DROP TABLE dbo.models;
IF OBJECT_ID('dbo.brands', 'U') IS NOT NULL DROP TABLE dbo.brands;
IF OBJECT_ID('dbo.colors', 'U') IS NOT NULL DROP TABLE dbo.colors;
IF OBJECT_ID('dbo.users_roles', 'U') IS NOT NULL DROP TABLE dbo.users_roles;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
IF OBJECT_ID('dbo.roles', 'U') IS NOT NULL DROP TABLE dbo.roles;
-- Extra tables from class diagram
IF OBJECT_ID('dbo.orders', 'U') IS NOT NULL DROP TABLE dbo.orders;
IF OBJECT_ID('dbo.payments', 'U') IS NOT NULL DROP TABLE dbo.payments;
IF OBJECT_ID('dbo.transactions', 'U') IS NOT NULL DROP TABLE dbo.transactions;
IF OBJECT_ID('dbo.product_images', 'U') IS NOT NULL DROP TABLE dbo.product_images;
IF OBJECT_ID('dbo.ratings', 'U') IS NOT NULL DROP TABLE dbo.ratings;
IF OBJECT_ID('dbo.products', 'U') IS NOT NULL DROP TABLE dbo.products;
IF OBJECT_ID('dbo.categories', 'U') IS NOT NULL DROP TABLE dbo.categories;
IF OBJECT_ID('dbo.articles', 'U') IS NOT NULL DROP TABLE dbo.articles;
IF OBJECT_ID('dbo.contacts', 'U') IS NOT NULL DROP TABLE dbo.contacts;
IF OBJECT_ID('dbo.admins', 'U') IS NOT NULL DROP TABLE dbo.admins;
GO

/* 3) CREATE TABLES */
CREATE TABLE dbo.roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE dbo.users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    created_date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    updated_date DATE NULL,
    deleted_date DATE NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL
);

CREATE TABLE dbo.users_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    CONSTRAINT PK_users_roles PRIMARY KEY (user_id, role_id),
    CONSTRAINT FK_users_roles_user FOREIGN KEY (user_id) REFERENCES dbo.users(id),
    CONSTRAINT FK_users_roles_role FOREIGN KEY (role_id) REFERENCES dbo.roles(id)
);

CREATE TABLE dbo.brands (
    id INT IDENTITY(1,1) PRIMARY KEY,
    created_date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    updated_date DATE NULL,
    deleted_date DATE NULL,
    name NVARCHAR(100) NOT NULL,
    logo_path NVARCHAR(500) NULL
);

CREATE TABLE dbo.models (
    id INT IDENTITY(1,1) PRIMARY KEY,
    created_date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    updated_date DATE NULL,
    deleted_date DATE NULL,
    name NVARCHAR(100) NOT NULL,
    brand_id INT NOT NULL,
    CONSTRAINT FK_models_brand FOREIGN KEY (brand_id) REFERENCES dbo.brands(id)
);

CREATE TABLE dbo.colors (
    id INT IDENTITY(1,1) PRIMARY KEY,
    created_date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    updated_date DATE NULL,
    deleted_date DATE NULL,
    name NVARCHAR(50) NOT NULL,
    code NVARCHAR(20) NULL
);

CREATE TABLE dbo.cars (
    id INT IDENTITY(1,1) PRIMARY KEY,
    created_date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    updated_date DATE NULL,
    deleted_date DATE NULL,
    model_year SMALLINT NOT NULL,
    plate NVARCHAR(30) NOT NULL UNIQUE,
    min_findeks_rate SMALLINT NOT NULL,
    kilometer BIGINT NOT NULL,
    daily_price FLOAT NOT NULL,
    image_path NVARCHAR(500) NULL,
    model_id INT NOT NULL,
    color_id INT NOT NULL,
    CONSTRAINT FK_cars_model FOREIGN KEY (model_id) REFERENCES dbo.models(id),
    CONSTRAINT FK_cars_color FOREIGN KEY (color_id) REFERENCES dbo.colors(id)
);

CREATE TABLE dbo.customers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    created_date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    updated_date DATE NULL,
    deleted_date DATE NULL,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    birthdate DATE NULL,
    international_id NVARCHAR(50) NULL,
    licence_issue_date DATE NULL,
    user_id INT NOT NULL,
    CONSTRAINT FK_customers_user FOREIGN KEY (user_id) REFERENCES dbo.users(id)
);

CREATE TABLE dbo.corporate_customers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    created_date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    updated_date DATE NULL,
    deleted_date DATE NULL,
    company_name NVARCHAR(200) NOT NULL,
    tax_no NVARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    CONSTRAINT FK_corporate_customers_user FOREIGN KEY (user_id) REFERENCES dbo.users(id)
);

CREATE TABLE dbo.rentals (
    id INT IDENTITY(1,1) PRIMARY KEY,
    created_date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    updated_date DATE NULL,
    deleted_date DATE NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    return_date DATE NULL,
    start_kilometer BIGINT NULL,
    end_kilometer BIGINT NULL,
    total_price FLOAT NOT NULL,
    car_id INT NOT NULL,
    user_id INT NOT NULL,
    CONSTRAINT FK_rentals_car FOREIGN KEY (car_id) REFERENCES dbo.cars(id),
    CONSTRAINT FK_rentals_user FOREIGN KEY (user_id) REFERENCES dbo.users(id)
);

CREATE TABLE dbo.invoices (
    id INT IDENTITY(1,1) PRIMARY KEY,
    created_date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    updated_date DATE NULL,
    deleted_date DATE NULL,
    invoice_no NVARCHAR(50) NOT NULL,
    total_price FLOAT NOT NULL,
    discount_rate FLOAT NOT NULL,
    tax_rate FLOAT NOT NULL,
    rental_id INT NOT NULL,
    CONSTRAINT FK_invoices_rental FOREIGN KEY (rental_id) REFERENCES dbo.rentals(id)
);
GO

/* 3b) CREATE EXTRA TABLES (Class Diagram) */
CREATE TABLE dbo.admins (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    active TINYINT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    slug NVARCHAR(150) NOT NULL UNIQUE,
    active TINYINT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    categoryId INT NOT NULL,
    name NVARCHAR(200) NOT NULL,
    slug NVARCHAR(250) NOT NULL UNIQUE,
    priceSale BIGINT NULL,
    priceRent BIGINT NULL,
    avatar NVARCHAR(500) NULL,
    status TINYINT NOT NULL DEFAULT 1,
    active TINYINT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_products_category FOREIGN KEY (categoryId) REFERENCES dbo.categories(id)
);

CREATE TABLE dbo.product_images (
    id INT IDENTITY(1,1) PRIMARY KEY,
    productId INT NOT NULL,
    path NVARCHAR(500) NOT NULL,
    CONSTRAINT FK_product_images_product FOREIGN KEY (productId) REFERENCES dbo.products(id)
);

CREATE TABLE dbo.ratings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    productId INT NOT NULL,
    userId INT NOT NULL,
    content NVARCHAR(MAX) NULL,
    ratingNumber TINYINT NOT NULL CHECK (ratingNumber BETWEEN 1 AND 5),
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ratings_product FOREIGN KEY (productId) REFERENCES dbo.products(id),
    CONSTRAINT FK_ratings_user FOREIGN KEY (userId) REFERENCES dbo.users(id)
);

CREATE TABLE dbo.contacts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(30) NULL,
    content NVARCHAR(MAX) NOT NULL,
    status TINYINT NOT NULL DEFAULT 0
);

CREATE TABLE dbo.articles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    adminId INT NOT NULL,
    title NVARCHAR(300) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    active TINYINT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_articles_admin FOREIGN KEY (adminId) REFERENCES dbo.admins(id)
);

CREATE TABLE dbo.transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    totalMoney BIGINT NOT NULL DEFAULT 0,
    type TINYINT NOT NULL, -- 1=sale, 2=rent
    status TINYINT NOT NULL DEFAULT 0,
    startDate DATETIME2 NULL,
    endDate DATETIME2 NULL,
    actualReturnDate DATETIME2 NULL,
    damageFee BIGINT NULL,
    refundAmount BIGINT NULL,
    returnNotes NVARCHAR(MAX) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_transactions_user FOREIGN KEY (userId) REFERENCES dbo.users(id)
);

CREATE TABLE dbo.orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    transactionId INT NOT NULL,
    method NVARCHAR(50) NULL,
    vnpayCode NVARCHAR(100) NULL,
    productId INT NOT NULL,
    price BIGINT NOT NULL,
    qty INT NOT NULL DEFAULT 1,
    CONSTRAINT FK_orders_transaction FOREIGN KEY (transactionId) REFERENCES dbo.transactions(id),
    CONSTRAINT FK_orders_product FOREIGN KEY (productId) REFERENCES dbo.products(id)
);

CREATE TABLE dbo.payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    transactionId INT NOT NULL,
    method NVARCHAR(50) NOT NULL,
    vnpayCode NVARCHAR(100) NULL,
    amount BIGINT NOT NULL,
    status TINYINT NOT NULL DEFAULT 0,
    CONSTRAINT FK_payments_transaction FOREIGN KEY (transactionId) REFERENCES dbo.transactions(id)
);
GO

/* 4) INSERT DATA */
BEGIN TRY
    BEGIN TRAN;

    -- Roles
    INSERT INTO dbo.roles(name) VALUES (N'admin'), (N'user');

    -- Users (BCrypt hashes from existing app setup)
    INSERT INTO dbo.users(email, password) VALUES
    (N'admin@autohub.vn', N'$2a$10$o6wG9ATwHTK8mGgNzoSAouJNUGVKBXm3FHTxDAx2ZUEP.NMdz50cq'), -- Admin@123
    (N'vana@gmail.com',   N'$2a$10$nhcxSQ7pyS0g0FLtz9VpWO5FCn7ifiNJpLb/OnwLKBfFa.Wi353K.'), -- User@123
    (N'bich@gmail.com',   N'$2a$10$jdnK3t7bDP1Fjk4/ZQoXtOPTzxvijpFUpZIBVcrBMwf.Xap4P27Wi'), -- User@123
    (N'vanc@gmail.com',   N'$2a$10$Buzf/23Hf2zbB9EakMsgF.Txu.BF2me4SLFtz2YSw4CijASmfHDB6'); -- User@123

    -- Users_roles
    INSERT INTO dbo.users_roles(user_id, role_id)
    SELECT u.id, r.id FROM dbo.users u CROSS JOIN dbo.roles r
    WHERE u.email = N'admin@autohub.vn' AND r.name = N'admin';

    INSERT INTO dbo.users_roles(user_id, role_id)
    SELECT u.id, r.id FROM dbo.users u CROSS JOIN dbo.roles r
    WHERE u.email IN (N'vana@gmail.com', N'bich@gmail.com', N'vanc@gmail.com') AND r.name = N'user';

    -- Colors
    INSERT INTO dbo.colors(name, code) VALUES
    (N'Trang', N'#FFFFFF'),
    (N'Den',   N'#000000'),
    (N'Bac',   N'#C0C0C0'),
    (N'Do',    N'#DC2626'),
    (N'Xanh',  N'#2563EB'),
    (N'Xam',   N'#6B7280'),
    (N'Vang',  N'#F59E0B'),
    (N'Nau',   N'#92400E');

    -- Brands
    INSERT INTO dbo.brands(name, logo_path) VALUES
    (N'Toyota',   N'https://upload.wikimedia.org/wikipedia/commons/e/ee/Toyota_logo_%28Red%29.png'),
    (N'Honda',    N'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg'),
    (N'Hyundai',  N'https://upload.wikimedia.org/wikipedia/commons/0/04/Hyundai_Motor_Company_logo.svg'),
    (N'Mazda',    N'https://upload.wikimedia.org/wikipedia/commons/1/17/Mazda_Motor_Corporation_logo.svg'),
    (N'Ford',     N'https://upload.wikimedia.org/wikipedia/commons/1/1e/Ford_logo_flat.svg'),
    (N'Kia',      N'https://upload.wikimedia.org/wikipedia/commons/1/13/Kia-logo.svg'),
    (N'Mercedes', N'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg'),
    (N'BMW',      N'https://upload.wikimedia.org/wikipedia/commons/f/f4/BMW_logo_%28gray%29.svg');

    -- Models
    INSERT INTO dbo.models(name, brand_id)
    SELECT N'Camry', b.id FROM dbo.brands b WHERE b.name = N'Toyota' UNION ALL
    SELECT N'Corolla', b.id FROM dbo.brands b WHERE b.name = N'Toyota' UNION ALL
    SELECT N'Fortuner', b.id FROM dbo.brands b WHERE b.name = N'Toyota' UNION ALL
    SELECT N'Vios', b.id FROM dbo.brands b WHERE b.name = N'Toyota' UNION ALL
    SELECT N'Civic', b.id FROM dbo.brands b WHERE b.name = N'Honda' UNION ALL
    SELECT N'CRV', b.id FROM dbo.brands b WHERE b.name = N'Honda' UNION ALL
    SELECT N'Tucson', b.id FROM dbo.brands b WHERE b.name = N'Hyundai' UNION ALL
    SELECT N'SantaFe', b.id FROM dbo.brands b WHERE b.name = N'Hyundai' UNION ALL
    SELECT N'CXFive', b.id FROM dbo.brands b WHERE b.name = N'Mazda' UNION ALL
    SELECT N'Ranger', b.id FROM dbo.brands b WHERE b.name = N'Ford' UNION ALL
    SELECT N'Sportage', b.id FROM dbo.brands b WHERE b.name = N'Kia' UNION ALL
    SELECT N'CClass', b.id FROM dbo.brands b WHERE b.name = N'Mercedes';

    -- Cars (enough for UI listing/filtering)
    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'51A12345', 2022, 25000,  750000, m.id, c.id, 1000, N'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'Camry' AND c.name = N'Trang';

    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'51B23456', 2023,  8000,  650000, m.id, c.id,  800, N'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'Vios' AND c.name = N'Bac';

    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'51C34567', 2022, 15000,  900000, m.id, c.id, 1200, N'https://images.unsplash.com/photo-1669215420013-a8c37a0e09ee?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'Fortuner' AND c.name = N'Den';

    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'51D45678', 2023,  5000,  800000, m.id, c.id,  900, N'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'Civic' AND c.name = N'Trang';

    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'51E56789', 2022, 18000, 1100000, m.id, c.id, 1100, N'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'CRV' AND c.name = N'Xam';

    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'51F67890', 2023,  9000,  950000, m.id, c.id, 1000, N'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'Tucson' AND c.name = N'Xanh';

    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'51G78901', 2022, 22000, 1300000, m.id, c.id, 1300, N'https://images.unsplash.com/photo-1568844293986-ca9c5c0b4ff5?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'SantaFe' AND c.name = N'Den';

    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'51H89012', 2023,  6000,  850000, m.id, c.id,  950, N'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'CXFive' AND c.name = N'Trang';

    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'51I90123', 2023, 7000, 1500000, m.id, c.id, 1400, N'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'Ranger' AND c.name = N'Den';

    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'51J01234', 2023, 6000, 1600000, m.id, c.id, 1500, N'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'Sportage' AND c.name = N'Xanh';

    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'51K11223', 2023, 3000, 2200000, m.id, c.id, 2000, N'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'CClass' AND c.name = N'Den';

    -- More cars for richer listing
    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'60A11111', 2021, 32000, 700000, m.id, c.id, 900, N'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'Corolla' AND c.name = N'Xam';
    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'60A22222', 2020, 45000, 600000, m.id, c.id, 800, N'https://images.unsplash.com/photo-1563720223185-11003d5163d1?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'Vios' AND c.name = N'Vang';
    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'60A33333', 2023,  9000, 980000, m.id, c.id, 1100, N'https://images.unsplash.com/photo-1544441893-675973e31985?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'CRV' AND c.name = N'Den';
    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'60A44444', 2022, 15000, 920000, m.id, c.id, 1000, N'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'Tucson' AND c.name = N'Bac';
    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'60A55555', 2023,  7000, 860000, m.id, c.id, 950, N'https://images.unsplash.com/photo-1529946825183-536c4c59e23b?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'Camry' AND c.name = N'Xanh';
    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'60A66666', 2021, 26000, 760000, m.id, c.id, 900, N'https://images.unsplash.com/photo-1461632830798-3adb3034e4f6?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'Corolla' AND c.name = N'Trang';
    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'60A77777', 2022, 12000, 1450000, m.id, c.id, 1600, N'https://images.unsplash.com/photo-1549921296-3a6b3c2d6b0a?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'CClass' AND c.name = N'Bac';
    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'60A88888', 2023,  8000, 1550000, m.id, c.id, 1700, N'https://images.unsplash.com/photo-1616789914311-5a9e6a0eefc9?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'CClass' AND c.name = N'Trang';
    INSERT INTO dbo.cars(plate, model_year, kilometer, daily_price, model_id, color_id, min_findeks_rate, image_path)
    SELECT N'60A99999', 2022, 19000, 1580000, m.id, c.id, 1750, N'https://images.unsplash.com/photo-1616789914693-1a2b0a2ea098?w=800'
    FROM dbo.models m CROSS JOIN dbo.colors c WHERE m.name = N'CClass' AND c.name = N'Xam';

    -- Customers
    INSERT INTO dbo.customers(first_name, last_name, birthdate, international_id, licence_issue_date, user_id)
    SELECT N'Nguyen', N'Van An', '1990-05-15', N'012345678901', '2015-03-01', u.id FROM dbo.users u WHERE u.email = N'vana@gmail.com';

    INSERT INTO dbo.customers(first_name, last_name, birthdate, international_id, licence_issue_date, user_id)
    SELECT N'Tran', N'Thi Bich', '1992-08-20', N'023456789012', '2016-06-15', u.id FROM dbo.users u WHERE u.email = N'bich@gmail.com';

    INSERT INTO dbo.customers(first_name, last_name, birthdate, international_id, licence_issue_date, user_id)
    SELECT N'Le', N'Van C', '1988-12-10', N'034567890123', '2014-09-20', u.id FROM dbo.users u WHERE u.email = N'vanc@gmail.com';

    -- Rentals + invoices sample
    INSERT INTO dbo.rentals(start_date, end_date, return_date, start_kilometer, end_kilometer, total_price, car_id, user_id)
    SELECT CAST(GETDATE()+1 AS DATE), CAST(GETDATE()+4 AS DATE), NULL, c.kilometer, NULL, c.daily_price*3, c.id, u.id
    FROM dbo.cars c CROSS JOIN dbo.users u
    WHERE c.plate = N'51A12345' AND u.email = N'vana@gmail.com';

    INSERT INTO dbo.rentals(start_date, end_date, return_date, start_kilometer, end_kilometer, total_price, car_id, user_id)
    SELECT CAST(GETDATE()+2 AS DATE), CAST(GETDATE()+6 AS DATE), NULL, c.kilometer, NULL, c.daily_price*4, c.id, u.id
    FROM dbo.cars c CROSS JOIN dbo.users u
    WHERE c.plate = N'51C34567' AND u.email = N'bich@gmail.com';

    INSERT INTO dbo.invoices(invoice_no, total_price, discount_rate, tax_rate, rental_id)
    SELECT N'INV-2026-0001', r.total_price, 5, 10, r.id
    FROM dbo.rentals r
    WHERE r.id = (SELECT MIN(id) FROM dbo.rentals);

    -- Admins
    INSERT INTO dbo.admins(name, email, password) VALUES
    (N'System Admin', N'admin@autohub.vn', N'$2a$10$o6wG9ATwHTK8mGgNzoSAouJNUGVKBXm3FHTxDAx2ZUEP.NMdz50cq');

    -- Categories for e-commerce layer
    INSERT INTO dbo.categories(name, slug) VALUES
    (N'Sedan', N'sedan'),
    (N'SUV', N'suv'),
    (N'Truck', N'truck'),
    (N'Luxury', N'luxury'),
    (N'Crossover', N'crossover'),
    (N'Hatchback', N'hatchback'),
    (N'EV', N'ev');

    -- Map cars to products (simplified: one product per car)
    INSERT INTO dbo.products(categoryId, name, slug, priceSale, priceRent, avatar, status, active)
    SELECT
        CASE
            WHEN m.name IN (N'Camry', N'Corolla', N'CClass') THEN (SELECT id FROM dbo.categories WHERE slug = N'sedan')
            WHEN m.name IN (N'CRV', N'Tucson', N'SantaFe', N'Sportage') THEN (SELECT id FROM dbo.categories WHERE slug = N'suv')
            WHEN m.name IN (N'Ranger') THEN (SELECT id FROM dbo.categories WHERE slug = N'truck')
            WHEN b.name IN (N'Mercedes', N'BMW') THEN (SELECT id FROM dbo.categories WHERE slug = N'luxury')
            ELSE (SELECT id FROM dbo.categories WHERE slug = N'crossover')
        END,
        CONCAT(b.name, N' ', m.name, N' - ', c.plate),
        LOWER(REPLACE(CONCAT(b.name, N'-', m.name, N'-', c.plate), N' ', N'-')),
        CAST(c.daily_price * 365 * 0.7 AS BIGINT), -- rough sale price
        CAST(c.daily_price AS BIGINT),
        c.image_path,
        1, 1
    FROM dbo.cars c
    JOIN dbo.models m ON m.id = c.model_id
    JOIN dbo.brands b ON b.id = m.brand_id;

    -- Product images (1 extra image each, demo)
    INSERT INTO dbo.product_images(productId, path)
    SELECT p.id, REPLACE(p.avatar, N'w=800', N'w=1200')
    FROM dbo.products p;

    -- Ratings samples
    INSERT INTO dbo.ratings(productId, userId, content, ratingNumber)
    SELECT TOP 10 p.id, u.id, N'Xe chạy êm, tiết kiệm nhiên liệu.', 5
    FROM dbo.products p CROSS JOIN dbo.users u
    WHERE u.email IN (N'vana@gmail.com', N'bich@gmail.com');

    -- Contacts samples
    INSERT INTO dbo.contacts(name, phone, content, status) VALUES
    (N'Khách A', N'0900000001', N'Tôi cần thuê xe 7 chỗ cuối tuần này.', 0),
    (N'Khách B', N'0900000002', N'Xin báo giá mua xe Camry 2022.', 0);

    -- Articles samples
    INSERT INTO dbo.articles(adminId, title, content)
    SELECT a.id, N'Mẹo thuê xe tiết kiệm', N'Nên đặt sớm, kiểm tra giấy tờ và bảo hiểm trước khi nhận xe.'
    FROM dbo.admins a WHERE a.email = N'admin@autohub.vn';

    -- Transactions, Orders, Payments samples
    -- Rent transaction for user vana
    DECLARE @uid_vana INT = (SELECT id FROM dbo.users WHERE email = N'vana@gmail.com');
    INSERT INTO dbo.transactions(userId, totalMoney, type, status, startDate, endDate)
    VALUES (@uid_vana, 0, 2, 0, DATEADD(DAY, 3, SYSUTCDATETIME()), DATEADD(DAY, 6, SYSUTCDATETIME()));
    DECLARE @tran1 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.orders(transactionId, method, vnpayCode, productId, price, qty)
    SELECT TOP 1 @tran1, N'RENT', NULL, p.id, p.priceRent, 1 FROM dbo.products p ORDER BY NEWID();
    UPDATE dbo.transactions SET totalMoney =
        (SELECT SUM(price*qty) FROM dbo.orders WHERE transactionId=@tran1)
    WHERE id=@tran1;
    INSERT INTO dbo.payments(transactionId, method, amount, status)
    VALUES (@tran1, N'VNPAY', (SELECT totalMoney FROM dbo.transactions WHERE id=@tran1), 1);

    -- Sale transaction for user bich
    DECLARE @uid_bich INT = (SELECT id FROM dbo.users WHERE email = N'bich@gmail.com');
    INSERT INTO dbo.transactions(userId, totalMoney, type, status)
    VALUES (@uid_bich, 0, 1, 0);
    DECLARE @tran2 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.orders(transactionId, method, vnpayCode, productId, price, qty)
    SELECT TOP 1 @tran2, N'SALE', NULL, p.id, p.priceSale, 1 FROM dbo.products p WHERE p.priceSale IS NOT NULL ORDER BY NEWID();
    UPDATE dbo.transactions SET totalMoney =
        (SELECT SUM(price*qty) FROM dbo.orders WHERE transactionId=@tran2)
    WHERE id=@tran2;
    INSERT INTO dbo.payments(transactionId, method, amount, status)
    VALUES (@tran2, N'COD', (SELECT totalMoney FROM dbo.transactions WHERE id=@tran2), 1);

    COMMIT TRAN;
    PRINT N'AutoHub SQL Server init + seed completed successfully.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
END CATCH;
GO

-- Quick verify (cars listing for frontend)
SELECT TOP 20
    c.id,
    c.plate,
    c.model_year,
    c.daily_price,
    b.name  AS brand_name,
    m.name  AS model_name,
    cl.name AS color_name,
    c.image_path
FROM dbo.cars c
JOIN dbo.models m ON m.id = c.model_id
JOIN dbo.brands b ON b.id = m.brand_id
JOIN dbo.colors cl ON cl.id = c.color_id
ORDER BY c.id;

-- Verify products join for e-commerce
SELECT TOP 20
    p.id,
    p.name,
    p.slug,
    p.priceSale,
    p.priceRent,
    cat.name AS category,
    p.avatar
FROM dbo.products p
JOIN dbo.categories cat ON cat.id = p.categoryId
ORDER BY p.id;
