-- Performance indexes for frequently queried columns
-- Flyway V1: initial index migration

-- Users
CREATE INDEX IF NOT EXISTS IX_users_email ON users(email);

-- Rentals
CREATE INDEX IF NOT EXISTS IX_rentals_user_id ON rentals(user_id);
CREATE INDEX IF NOT EXISTS IX_rentals_car_id ON rentals(car_id);
CREATE INDEX IF NOT EXISTS IX_rentals_rental_status ON rentals(rental_status);
CREATE INDEX IF NOT EXISTS IX_rentals_start_date ON rentals(start_date);

-- Sale orders
CREATE INDEX IF NOT EXISTS IX_sale_orders_user_id ON sale_orders(user_id);
CREATE INDEX IF NOT EXISTS IX_sale_orders_car_id ON sale_orders(car_id);
CREATE INDEX IF NOT EXISTS IX_sale_orders_order_status ON sale_orders(order_status);

-- Cars
CREATE INDEX IF NOT EXISTS IX_cars_model_id ON cars(model_id);
CREATE INDEX IF NOT EXISTS IX_cars_listing_type ON cars(listing_type);
CREATE INDEX IF NOT EXISTS IX_cars_sale_status ON cars(sale_status);

-- Reviews
CREATE INDEX IF NOT EXISTS IX_reviews_rental_id ON reviews(rental_id);
CREATE INDEX IF NOT EXISTS IX_reviews_sale_order_id ON reviews(sale_order_id);
CREATE INDEX IF NOT EXISTS IX_reviews_user_id ON reviews(user_id);

-- Viewing appointments
CREATE INDEX IF NOT EXISTS IX_viewing_appointments_user_id ON viewing_appointments(user_id);
CREATE INDEX IF NOT EXISTS IX_viewing_appointments_car_id ON viewing_appointments(car_id);
CREATE INDEX IF NOT EXISTS IX_viewing_appointments_scheduled_at ON viewing_appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS IX_viewing_appointments_status ON viewing_appointments(status);

-- Invoices
CREATE INDEX IF NOT EXISTS IX_invoices_rental_id ON invoices(rental_id);
