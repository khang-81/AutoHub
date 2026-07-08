-- V9__add_rental_time_fields.sql
-- Sprint 4: TIME precision cho overlap check (morning/afternoon split).
-- DDL thêm cột start_time/end_time đã được JPA hibernate.hbm2ddl.auto=update
-- tự động tạo qua entity Rental (@Column startTime/endTime). Không cần DDL
-- ở đây vì SQL Server hay fail khi phân tích batch có nhiều statement
-- (lỗi "Invalid column name 207" nếu references column being added in same batch).
-- Migration này là NO-OP để giữ Flyway history nhất quán.
SELECT 1;
