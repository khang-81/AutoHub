const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../docker/sqlserver-init/autohub-full-schema.sql');
const valsPath = path.join(__dirname, '_car_values_indented.sql');

let s = fs.readFileSync(schemaPath, 'utf8');
const vals = fs.readFileSync(valsPath, 'utf8').trim();

const start = '/* Xe mẫu:';
const markerEnd = '/* user_documents (KYC mẫu) */';
const i = s.indexOf(start);
const j = s.indexOf(markerEnd);
if (i < 0 || j < 0 || j <= i) {
  console.error('markers not found', { i, j });
  process.exit(1);
}

const newBlock = `/* Xe mẫu: VinFast, Toyota, Honda, Mazda, Mercedes-Benz — 5 thương hiệu × 3 model × (1 thuê + 1 mua); màu Trắng. */
DELETE FROM [dbo].[viewing_appointments];
DELETE FROM [dbo].[reviews];
DELETE FROM [dbo].[invoices];
DELETE FROM [dbo].[rentals];
DELETE FROM [dbo].[sale_orders];
DELETE FROM [dbo].[cars];
DBCC CHECKIDENT ('[dbo].[cars]', RESEED, 0);

INSERT INTO [dbo].[cars]
([created_date], [model_year], [service_city], [plate], [min_findeks_rate], [kilometer], [daily_price], [listing_type], [sale_price], [sale_status], [image_path], [model_id], [color_id])
SELECT
    CAST(GETDATE() AS DATE),
    src.model_year,
    N'Hà Nội',
    src.plate,
    src.min_findeks_rate,
    src.kilometer,
    src.daily_price,
    src.listing_type,
    src.sale_price,
    src.sale_status,
    src.image_path,
    m.id,
    c.id
FROM (
VALUES
${vals}
) AS src(plate, model_year, min_findeks_rate, kilometer, daily_price, listing_type, sale_price, sale_status, image_path, brand_name, model_name)
JOIN [dbo].[brands] b ON b.[name] = src.brand_name
JOIN [dbo].[models] m ON m.[brand_id] = b.[id] AND m.[name] = src.model_name
JOIN [dbo].[colors] c ON c.[name] = N'Trắng';
GO

`;

s = s.slice(0, i) + newBlock + s.slice(j);
fs.writeFileSync(schemaPath, s, 'utf8');
console.log('updated', schemaPath);
