-- Performance indexes for frequently queried columns
-- Flyway V1: initial index migration

-- Users
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_email' AND object_id = OBJECT_ID(N'dbo.users'))
BEGIN
    CREATE INDEX IX_users_email ON users(email);
END;

-- Rentals
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_rentals_user_id' AND object_id = OBJECT_ID(N'dbo.rentals'))
BEGIN
    CREATE INDEX IX_rentals_user_id ON rentals(user_id);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_rentals_car_id' AND object_id = OBJECT_ID(N'dbo.rentals'))
BEGIN
    CREATE INDEX IX_rentals_car_id ON rentals(car_id);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_rentals_rental_status' AND object_id = OBJECT_ID(N'dbo.rentals'))
BEGIN
    CREATE INDEX IX_rentals_rental_status ON rentals(rental_status);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_rentals_start_date' AND object_id = OBJECT_ID(N'dbo.rentals'))
BEGIN
    CREATE INDEX IX_rentals_start_date ON rentals(start_date);
END;

-- Sale orders
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_sale_orders_user_id' AND object_id = OBJECT_ID(N'dbo.sale_orders'))
BEGIN
    CREATE INDEX IX_sale_orders_user_id ON sale_orders(user_id);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_sale_orders_car_id' AND object_id = OBJECT_ID(N'dbo.sale_orders'))
BEGIN
    CREATE INDEX IX_sale_orders_car_id ON sale_orders(car_id);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_sale_orders_order_status' AND object_id = OBJECT_ID(N'dbo.sale_orders'))
BEGIN
    CREATE INDEX IX_sale_orders_order_status ON sale_orders(order_status);
END;

-- Cars
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_cars_model_id' AND object_id = OBJECT_ID(N'dbo.cars'))
BEGIN
    CREATE INDEX IX_cars_model_id ON cars(model_id);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_cars_listing_type' AND object_id = OBJECT_ID(N'dbo.cars'))
BEGIN
    CREATE INDEX IX_cars_listing_type ON cars(listing_type);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_cars_sale_status' AND object_id = OBJECT_ID(N'dbo.cars'))
BEGIN
    CREATE INDEX IX_cars_sale_status ON cars(sale_status);
END;

-- Reviews
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reviews_rental_id' AND object_id = OBJECT_ID(N'dbo.reviews'))
BEGIN
    CREATE INDEX IX_reviews_rental_id ON reviews(rental_id);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reviews_sale_order_id' AND object_id = OBJECT_ID(N'dbo.reviews'))
BEGIN
    CREATE INDEX IX_reviews_sale_order_id ON reviews(sale_order_id);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reviews_user_id' AND object_id = OBJECT_ID(N'dbo.reviews'))
BEGIN
    CREATE INDEX IX_reviews_user_id ON reviews(user_id);
END;

-- Viewing appointments
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_viewing_appointments_user_id' AND object_id = OBJECT_ID(N'dbo.viewing_appointments'))
BEGIN
    CREATE INDEX IX_viewing_appointments_user_id ON viewing_appointments(user_id);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_viewing_appointments_car_id' AND object_id = OBJECT_ID(N'dbo.viewing_appointments'))
BEGIN
    CREATE INDEX IX_viewing_appointments_car_id ON viewing_appointments(car_id);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_viewing_appointments_scheduled_at' AND object_id = OBJECT_ID(N'dbo.viewing_appointments'))
BEGIN
    CREATE INDEX IX_viewing_appointments_scheduled_at ON viewing_appointments(scheduled_at);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_viewing_appointments_status' AND object_id = OBJECT_ID(N'dbo.viewing_appointments'))
BEGIN
    CREATE INDEX IX_viewing_appointments_status ON viewing_appointments(status);
END;

-- Invoices
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_invoices_rental_id' AND object_id = OBJECT_ID(N'dbo.invoices'))
BEGIN
    CREATE INDEX IX_invoices_rental_id ON invoices(rental_id);
END;
