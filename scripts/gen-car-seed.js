const fs = require('fs');
const path = require('path');

const catalog = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'car-catalog.json'), 'utf8')
);

function sqlStr(s) {
  return `N'${String(s).replace(/'/g, "''")}'`;
}

function galleryFor(entry) {
  if (Array.isArray(entry.gallery) && entry.gallery.length > 0) {
    return entry.gallery.slice(0, 5);
  }
  return [{ type: 'EXTERIOR', url: entry.imageUrl }];
}

let n = 0;
const rows = [];
const imageRows = [];

for (const entry of catalog) {
  const gallery = galleryFor(entry);
  const cover = gallery[0]?.url || entry.imageUrl;
  for (const lt of ['RENT', 'SALE']) {
    n += 1;
    const plate = lt === 'RENT' ? `51R${String(n).padStart(4, '0')}` : `51S${String(n).padStart(4, '0')}`;
    const listing = lt === 'RENT' ? 'RENT_ONLY' : 'SALE_ONLY';
    const daily = lt === 'RENT' ? `${entry.dailyPrice}.0` : '0.0';
    const saleP = lt === 'SALE' ? `${entry.salePrice}.0` : 'NULL';
    const saleSt = lt === 'SALE' ? 'AVAILABLE' : 'NULL';
    const km = lt === 'RENT' ? 10000 + n * 100 : 0;
    const img = sqlStr(cover);
    rows.push(
      `(${sqlStr(plate)}, 2023, 500, ${km}, ${daily}, ${sqlStr(listing)}, ${saleP}, ${saleSt === 'NULL' ? 'NULL' : sqlStr(saleSt)}, ${img}, ${sqlStr(entry.brand)}, ${sqlStr(entry.model)})`
    );
    gallery.forEach((g, i) => {
      imageRows.push(
        `(${sqlStr(plate)}, ${i + 1}, ${sqlStr(g.url)}, ${sqlStr(g.type)})`
      );
    });
  }
}

// VF3 sale (row 2) — SOLD demo
rows[1] = rows[1].replace(sqlStr('AVAILABLE'), sqlStr('SOLD'));

const carValues = rows.map((r) => '      ' + r).join(',\n');
fs.writeFileSync(path.join(__dirname, '_car_values_indented.sql'), carValues, 'utf8');

const imageValues = imageRows.map((r) => '      ' + r).join(',\n');
const seedImagesSql = `-- Gallery 5 anh/xe (3 ngoai + 2 noi) — sinh tu car-catalog.json
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

const updates = [];
let idx = 0;
for (const entry of catalog) {
  const gallery = galleryFor(entry);
  const cover = gallery[0]?.url || entry.imageUrl;
  for (const lt of ['RENT', 'SALE']) {
    idx += 1;
    const plate = lt === 'RENT' ? `51R${String(idx).padStart(4, '0')}` : `51S${String(idx).padStart(4, '0')}`;
    const daily = lt === 'RENT' ? entry.dailyPrice : 0;
    const saleP = lt === 'SALE' ? entry.salePrice : null;
    updates.push(
      `UPDATE [dbo].[cars] SET [image_path]=${sqlStr(cover)}, [daily_price]=${daily}.0, [sale_price]=${saleP == null ? 'NULL' : saleP + '.0'} WHERE [plate]=${sqlStr(plate)};`
    );
  }
}
const updateSql =
  '-- Cap nhat anh bia + gia theo car-catalog.json\n' + updates.join('\n') + '\n\n' + seedImagesSql;
fs.writeFileSync(path.join(__dirname, 'update-car-catalog.sql'), updateSql, 'utf8');

console.log(`Generated ${rows.length} cars, ${imageRows.length} gallery rows, seed-car-images.sql`);
