const models = [
  ['VinFast', 'VF 3'],
  ['VinFast', 'VF 8'],
  ['VinFast', 'VF 9'],
  ['Toyota', 'Camry'],
  ['Toyota', 'Corolla Cross'],
  ['Toyota', 'Fortuner'],
  ['Honda', 'City'],
  ['Honda', 'Civic'],
  ['Honda', 'CR-V'],
  ['Mazda', 'Mazda3'],
  ['Mazda', 'CX-5'],
  ['Mazda', 'BT-50'],
  ['Mercedes-Benz', 'C-Class'],
  ['Mercedes-Benz', 'E-Class'],
  ['Mercedes-Benz', 'GLC'],
];
let n = 0;
const rows = [];
for (const [b, m] of models) {
  for (const lt of ['RENT', 'SALE']) {
    n += 1;
    const plate = lt === 'RENT' ? `N'51R${String(n).padStart(4, '0')}'` : `N'51S${String(n).padStart(4, '0')}'`;
    const listing = lt === 'RENT' ? "N'RENT_ONLY'" : "N'SALE_ONLY'";
    const daily = lt === 'RENT' ? `${800000 + n * 5000}.0` : '0.0';
    const saleP = lt === 'SALE' ? `${450000000 + n * 1000000}.0` : 'NULL';
    const saleSt = lt === 'SALE' ? "N'AVAILABLE'" : 'NULL';
    const km = lt === 'RENT' ? 10000 + n * 100 : 0;
    const fin = 500;
    const year = 2023;
    const img = `N'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&sig=${n}'`;
    rows.push(
      `(${plate}, ${year}, ${fin}, ${km}, ${daily}, ${listing}, ${saleP}, ${saleSt}, ${img}, N'${b}', N'${m}')`
    );
  }
}
// First sale row (VF3 bán) — SOLD để seed đơn mua demo
rows[1] = rows[1].replace("N'AVAILABLE'", "N'SOLD'");
const fs = require('fs');
const path = require('path');
const out = rows.map((r) => '      ' + r).join(',\n');
fs.writeFileSync(path.join(__dirname, '_car_values_indented.sql'), out, 'utf8');
