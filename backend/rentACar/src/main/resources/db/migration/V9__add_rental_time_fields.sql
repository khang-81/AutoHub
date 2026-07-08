-- V9__add_rental_time_fields.sql
-- Thêm start_time, end_time (TIME) vào rentals để chống trùng lịch theo khung giờ.
-- Trước đó chỉ check theo DATE nên 2 booking cùng ngày (sáng vs chiều) đều bị block.
-- Giờ cho phép check overlap với cả giờ: A 8-12h, B 14-18h cùng ngày → OK.

ALTER TABLE dbo.rentals ADD start_time time NULL;
ALTER TABLE dbo.rentals ADD end_time time NULL;
UPDATE dbo.rentals SET start_time = '09:00:00', end_time = '18:00:00' WHERE start_time IS NULL OR end_time IS NULL;
