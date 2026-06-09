const fs = require('fs');
const path = require('path');

const catalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'car-catalog.json'), 'utf8')
);

const EXPECTED_MODELS = 35;

function sqlStr(s) {
  return `N'${String(s).replace(/'/g, "''")}'`;
}

function galleryFor(entry) {
  if (Array.isArray(entry.gallery) && entry.gallery.length > 0) {
    return entry.gallery.slice(0, 5);
  }
  return [{ type: 'EXTERIOR', url: entry.imageUrl }];
}

if (catalog.length !== EXPECTED_MODELS) {
  throw new Error(`Expected ${EXPECTED_MODELS} models, got ${catalog.length}`);
}

const rows = [];
const imageRows = [];

catalog.forEach((entry, idx) => {
  const seq = idx + 1;
  const gallery = galleryFor(entry);
  const cover = gallery[0]?.url || entry.imageUrl;
  const year = entry.modelYear || 2023;
  const seats = entry.seats || 5;
  const trans = entry.transmission || 'AUTO';
  const fuel = entry.fuelType || 'GASOLINE';
  const rentKm = entry.rentKilometer ?? 10000 + seq * 500;
  const saleKm = entry.saleKilometer ?? 0;

  for (const [lt, plate, km] of [
    ['RENT', `51R${String(seq).padStart(4, '0')}`, rentKm],
    ['SALE', `51S${String(seq).padStart(4, '0')}`, saleKm],
  ]) {
    const listing = lt === 'RENT' ? 'RENT_ONLY' : 'SALE_ONLY';
    const daily = lt === 'RENT' ? `${entry.dailyPrice}.0` : '0.0';
    const saleP = lt === 'SALE' ? `${entry.salePrice}.0` : 'NULL';
    const saleSt = lt === 'SALE' ? sqlStr('AVAILABLE') : 'NULL';
    rows.push(
      `(${sqlStr(plate)}, ${year}, 500, ${km}, ${daily}, ${sqlStr(listing)}, ${saleP}, ${saleSt}, ${sqlStr(cover)}, ${seats}, ${sqlStr(trans)}, ${sqlStr(fuel)}, ${sqlStr(entry.brand)}, ${sqlStr(entry.model)})`
    );
    gallery.forEach((g, i) => {
      imageRows.push(
        `(${sqlStr(plate)}, ${i + 1}, ${sqlStr(g.url)}, ${sqlStr(g.type)})`
      );
    });
  }
});

const carValues = rows.map((r) => '      ' + r).join(',\n');
const imageValues = imageRows.map((r) => '      ' + r).join(',\n');

const carsBlock = `/* Danh mục xe thực tế: 35 model × (1 thuê + 1 bán) = 70 xe; không đơn/lịch demo. */
DELETE FROM [dbo].[viewing_appointments];
DELETE FROM [dbo].[reviews];
DELETE FROM [dbo].[invoices];
DELETE FROM [dbo].[rentals];
DELETE FROM [dbo].[sale_orders];
DELETE FROM [dbo].[car_images];
DELETE FROM [dbo].[cars];
DBCC CHECKIDENT ('[dbo].[cars]', RESEED, 0);

INSERT INTO [dbo].[cars]
([created_date], [model_year], [service_city], [plate], [min_findeks_rate], [kilometer], [daily_price], [listing_type], [sale_price], [sale_status], [image_path], [seats], [transmission], [fuel_type], [model_id], [color_id])
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
    src.seats,
    src.transmission,
    src.fuel_type,
    m.id,
    c.id
FROM (
VALUES
${carValues}
) AS src(plate, model_year, min_findeks_rate, kilometer, daily_price, listing_type, sale_price, sale_status, image_path, seats, transmission, fuel_type, brand_name, model_name)
JOIN [dbo].[brands] b ON b.[name] = src.brand_name
JOIN [dbo].[models] m ON m.[brand_id] = b.[id] AND m.[name] = src.model_name
JOIN [dbo].[colors] c ON c.[name] = N'Trắng';
GO

/* Gallery 5 ảnh / xe (3 ngoại + 2 nội thất) */
INSERT INTO [dbo].[car_images] ([car_id], [sort_order], [image_url], [image_type])
SELECT c.[id], src.[sort_order], src.[image_url], src.[image_type]
FROM (
VALUES
${imageValues}
) AS src([plate], [sort_order], [image_url], [image_type])
JOIN [dbo].[cars] c ON c.[plate] = src.[plate];
GO
`;

fs.writeFileSync(path.join(__dirname, '_generated_cars_block.sql'), carsBlock, 'utf8');

const seedImagesSql = `-- Gallery — sinh từ car-catalog.json
DELETE FROM [dbo].[car_images];
GO

INSERT INTO [dbo].[car_images] ([car_id], [sort_order], [image_url], [image_type])
SELECT c.[id], src.[sort_order], src.[image_url], src.[image_type]
FROM (
VALUES
${imageValues}
) AS src([plate], [sort_order], [image_url], [image_type])
JOIN [dbo].[cars] c ON c.[plate] = src.[plate];
GO
`;
fs.writeFileSync(path.join(__dirname, 'seed-car-images.sql'), seedImagesSql, 'utf8');

console.log(
  `Generated ${rows.length} cars (${EXPECTED_MODELS} thuê + ${EXPECTED_MODELS} bán), ${imageRows.length} gallery rows`
);
