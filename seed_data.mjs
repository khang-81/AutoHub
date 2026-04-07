// AutoHub - Data Seeding Script (Node.js ESM)
// Run: node seed_data.mjs
// Requires: Node.js 18+, backend running at http://localhost:8080

const BASE = 'http://localhost:8080';

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
  } catch (e) {
    console.log(`  [WARN] ${method} ${path}: ${e.message}`);
    return null;
  }
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

console.log('\n=== AutoHub Data Seeder ===\n');

// ─── STEP 1: Register Accounts ───────────────────────────────
console.log('[1] Registering accounts...');
await api('POST', '/api/auth/register', { email: 'admin@autohub.vn', password: 'Admin@123', roles: ['admin'] });
console.log('  OK: admin@autohub.vn / Admin@123');
await api('POST', '/api/auth/register', { email: 'vana@gmail.com', password: 'User@123', roles: ['user'] });
console.log('  OK: vana@gmail.com / User@123');
await api('POST', '/api/auth/register', { email: 'bich@gmail.com', password: 'User@123', roles: ['user'] });
console.log('  OK: bich@gmail.com / User@123');
await api('POST', '/api/auth/register', { email: 'vanc@gmail.com', password: 'User@123', roles: ['user'] });
console.log('  OK: vanc@gmail.com / User@123');

// ─── STEP 2: Login ───────────────────────────────────────────
console.log('\n[2] Logging in...');
const adminLoginRes = await api('POST', '/api/auth/login', { email: 'admin@autohub.vn', password: 'Admin@123' });
const ADMIN_TOKEN = adminLoginRes?.data;
if (!ADMIN_TOKEN) {
  console.error('[ERROR] Cannot get admin token! Is backend running?');
  console.error('  Response:', adminLoginRes);
  process.exit(1);
}
console.log('  OK: Admin token obtained');

const userLoginRes = await api('POST', '/api/auth/login', { email: 'vana@gmail.com', password: 'User@123' });
const USER_TOKEN = userLoginRes?.data;
console.log('  OK: User token obtained');

// ─── STEP 3: Colors ──────────────────────────────────────────
console.log('\n[3] Creating colors...');
const colorData = [
  { name: 'Trang', code: '#FFFFFF' },
  { name: 'Den', code: '#000000' },
  { name: 'Bac', code: '#C0C0C0' },
  { name: 'Do', code: '#DC2626' },
  { name: 'Xanh', code: '#2563EB' },
  { name: 'Xam', code: '#6B7280' },
  { name: 'Vang', code: '#F59E0B' },
  { name: 'Nau', code: '#92400E' },
];
for (const c of colorData) {
  await api('POST', '/api/colors/add', c, ADMIN_TOKEN);
  console.log(`  OK: Color ${c.name}`);
}
await sleep(200);
const allColors = await api('GET', '/api/colors/getAll');
const colorMap = {};
for (const c of (allColors || [])) colorMap[c.name] = c.id;
console.log(`  Total colors: ${allColors?.length}`);

// ─── STEP 4: Brands ──────────────────────────────────────────
console.log('\n[4] Creating brands...');
const brandData = [
  { name: 'Toyota', logoPath: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Toyota_logo_%28Red%29.png' },
  { name: 'Honda', logoPath: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg' },
  { name: 'Hyundai', logoPath: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Hyundai_Motor_Company_logo.svg' },
  { name: 'Mazda', logoPath: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Mazda_Motor_Corporation_logo.svg' },
  { name: 'Ford', logoPath: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Ford_logo_flat.svg' },
  { name: 'Kia', logoPath: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Kia-logo.svg' },
  { name: 'Mercedes', logoPath: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg' },
  { name: 'BMW', logoPath: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/BMW_logo_%28gray%29.svg' },
];
for (const b of brandData) {
  await api('POST', '/api/brands/add', b, ADMIN_TOKEN);
  console.log(`  OK: Brand ${b.name}`);
}
await sleep(200);
const allBrands = await api('GET', '/api/brands/getAll');
const brandMap = {};
for (const b of (allBrands || [])) brandMap[b.name] = b.id;
console.log(`  Total brands: ${allBrands?.length}`);

// ─── STEP 5: Models ──────────────────────────────────────────
console.log('\n[5] Creating models...');
const modelData = [
  { name: 'Camry', brandId: brandMap['Toyota'] },
  { name: 'Corolla', brandId: brandMap['Toyota'] },
  { name: 'Fortuner', brandId: brandMap['Toyota'] },
  { name: 'Innova', brandId: brandMap['Toyota'] },
  { name: 'Vios', brandId: brandMap['Toyota'] },
  { name: 'Civic', brandId: brandMap['Honda'] },
  { name: 'CRV', brandId: brandMap['Honda'] },
  { name: 'HRV', brandId: brandMap['Honda'] },
  { name: 'Tucson', brandId: brandMap['Hyundai'] },
  { name: 'SantaFe', brandId: brandMap['Hyundai'] },
  { name: 'Accent', brandId: brandMap['Hyundai'] },
  { name: 'CXFive', brandId: brandMap['Mazda'] },
  { name: 'MazdaThree', brandId: brandMap['Mazda'] },
  { name: 'CXEight', brandId: brandMap['Mazda'] },
  { name: 'Ranger', brandId: brandMap['Ford'] },
  { name: 'Everest', brandId: brandMap['Ford'] },
  { name: 'Seltos', brandId: brandMap['Kia'] },
  { name: 'Sportage', brandId: brandMap['Kia'] },
  { name: 'CClass', brandId: brandMap['Mercedes'] },
  { name: 'EClass', brandId: brandMap['Mercedes'] },
  { name: 'SeriesThree', brandId: brandMap['BMW'] },
  { name: 'SeriesFive', brandId: brandMap['BMW'] },
];
for (const m of modelData) {
  if (m.brandId > 0) {
    await api('POST', '/api/models/add', m, ADMIN_TOKEN);
    console.log(`  OK: Model ${m.name} (brandId=${m.brandId})`);
  }
}
await sleep(200);
const allModels = await api('GET', '/api/models/getAll');
const modelMap = {};
for (const m of (allModels || [])) modelMap[m.name] = m.id;
console.log(`  Total models: ${allModels?.length}`);

// ─── STEP 6: Cars ────────────────────────────────────────────
console.log('\n[6] Creating cars...');
const carsData = [
  { plate: '51A12345', modelYear: 2022, kilometer: 25000, dailyPrice: 750000, modelId: modelMap['Camry'],      colorId: colorMap['Trang'], minFindeksRate: 1000, imagePath: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800' },
  { plate: '51B23456', modelYear: 2023, kilometer: 8000,  dailyPrice: 650000, modelId: modelMap['Vios'],       colorId: colorMap['Bac'],   minFindeksRate: 800,  imagePath: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800' },
  { plate: '51C34567', modelYear: 2022, kilometer: 15000, dailyPrice: 900000, modelId: modelMap['Fortuner'],   colorId: colorMap['Den'],   minFindeksRate: 1200, imagePath: 'https://images.unsplash.com/photo-1669215420013-a8c37a0e09ee?w=800' },
  { plate: '51D45678', modelYear: 2021, kilometer: 32000, dailyPrice: 600000, modelId: modelMap['Corolla'],    colorId: colorMap['Do'],    minFindeksRate: 700,  imagePath: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800' },
  { plate: '51E56789', modelYear: 2023, kilometer: 5000,  dailyPrice: 800000, modelId: modelMap['Civic'],      colorId: colorMap['Trang'], minFindeksRate: 900,  imagePath: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800' },
  { plate: '51F67890', modelYear: 2022, kilometer: 18000, dailyPrice: 1100000, modelId: modelMap['CRV'],       colorId: colorMap['Xam'],   minFindeksRate: 1100, imagePath: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800' },
  { plate: '51G78901', modelYear: 2023, kilometer: 9000,  dailyPrice: 950000, modelId: modelMap['Tucson'],     colorId: colorMap['Xanh'],  minFindeksRate: 1000, imagePath: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800' },
  { plate: '51H89012', modelYear: 2022, kilometer: 22000, dailyPrice: 1300000, modelId: modelMap['SantaFe'],   colorId: colorMap['Den'],   minFindeksRate: 1300, imagePath: 'https://images.unsplash.com/photo-1568844293986-ca9c5c0b4ff5?w=800' },
  { plate: '51I90123', modelYear: 2023, kilometer: 6000,  dailyPrice: 850000, modelId: modelMap['CXFive'],     colorId: colorMap['Trang'], minFindeksRate: 950,  imagePath: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800' },
  { plate: '51J01234', modelYear: 2021, kilometer: 40000, dailyPrice: 720000, modelId: modelMap['MazdaThree'], colorId: colorMap['Do'],    minFindeksRate: 750,  imagePath: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800' },
  { plate: '51K11234', modelYear: 2023, kilometer: 7000,  dailyPrice: 1500000, modelId: modelMap['Ranger'],    colorId: colorMap['Den'],   minFindeksRate: 1400, imagePath: 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?w=800' },
  { plate: '51L22345', modelYear: 2022, kilometer: 12000, dailyPrice: 870000, modelId: modelMap['Seltos'],     colorId: colorMap['Bac'],   minFindeksRate: 900,  imagePath: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800' },
  { plate: '51M33456', modelYear: 2023, kilometer: 3000,  dailyPrice: 2200000, modelId: modelMap['CClass'],    colorId: colorMap['Den'],   minFindeksRate: 2000, imagePath: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800' },
  { plate: '51N44567', modelYear: 2022, kilometer: 20000, dailyPrice: 2500000, modelId: modelMap['EClass'],    colorId: colorMap['Trang'], minFindeksRate: 2200, imagePath: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800' },
  { plate: '51O55678', modelYear: 2023, kilometer: 8000,  dailyPrice: 2800000, modelId: modelMap['SeriesThree'], colorId: colorMap['Xam'], minFindeksRate: 2400, imagePath: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800' },
  { plate: '51P66789', modelYear: 2022, kilometer: 15000, dailyPrice: 1000000, modelId: modelMap['Innova'],    colorId: colorMap['Trang'], minFindeksRate: 1000, imagePath: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800' },
  { plate: '51Q77890', modelYear: 2023, kilometer: 4000,  dailyPrice: 1200000, modelId: modelMap['CXEight'],   colorId: colorMap['Nau'],   minFindeksRate: 1200, imagePath: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800' },
  { plate: '51R88901', modelYear: 2021, kilometer: 35000, dailyPrice: 680000, modelId: modelMap['Accent'],     colorId: colorMap['Vang'],  minFindeksRate: 700,  imagePath: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800' },
  { plate: '51S99012', modelYear: 2023, kilometer: 6000,  dailyPrice: 1600000, modelId: modelMap['Sportage'],  colorId: colorMap['Xanh'],  minFindeksRate: 1500, imagePath: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800' },
  { plate: '51T10123', modelYear: 2022, kilometer: 19000, dailyPrice: 3200000, modelId: modelMap['SeriesFive'], colorId: colorMap['Den'],  minFindeksRate: 2800, imagePath: 'https://images.unsplash.com/photo-1520608760-eff2c44973f0?w=800' },
];

let carCount = 0;
for (const car of carsData) {
  if (car.modelId && car.colorId) {
    const r = await api('POST', '/api/cars/add', car, ADMIN_TOKEN);
    if (r?.success !== false) carCount++;
    console.log(`  OK: Car ${car.plate} (${car.dailyPrice.toLocaleString()} VND/day)`);
  } else {
    console.log(`  [SKIP] Car ${car.plate} - modelId=${car.modelId} colorId=${car.colorId}`);
  }
}
await sleep(300);
const allCars = await api('GET', '/api/cars/getAll');
console.log(`  Total cars: ${allCars?.length}`);

// ─── STEP 7: Get Users ────────────────────────────────────────
console.log('\n[7] Getting users...');
const allUsers = await api('GET', '/api/users/getAll', null, ADMIN_TOKEN);
const userIdMap = {};
for (const u of (Array.isArray(allUsers) ? allUsers : [])) userIdMap[u.email] = u.id;

const adminId = userIdMap['admin@autohub.vn'];
const user1Id = userIdMap['vana@gmail.com'];
const user2Id = userIdMap['bich@gmail.com'];
const user3Id = userIdMap['vanc@gmail.com'];
console.log(`  Users: admin=${adminId}, user1=${user1Id}, user2=${user2Id}, user3=${user3Id}`);

// Customer profiles
console.log('\n  Creating customer profiles...');
if (user1Id) {
  await api('POST', '/api/customers/add', { firstName: 'Nguyen', lastName: 'Van An', birthdate: '1990-05-15', internationalId: '012345678901', licenceIssueDate: '2015-03-01', userId: user1Id });
  console.log('  OK: Customer Nguyen Van An');
}
if (user2Id) {
  await api('POST', '/api/customers/add', { firstName: 'Tran', lastName: 'Thi Bich', birthdate: '1992-08-20', internationalId: '023456789012', licenceIssueDate: '2016-06-15', userId: user2Id });
  console.log('  OK: Customer Tran Thi Bich');
}
if (user3Id) {
  await api('POST', '/api/customers/add', { firstName: 'Le', lastName: 'Van C', birthdate: '1988-12-10', internationalId: '034567890123', licenceIssueDate: '2014-09-20', userId: user3Id });
  console.log('  OK: Customer Le Van C');
}

// ─── STEP 8: Rentals ─────────────────────────────────────────
console.log('\n[8] Creating rentals...');
const cars = allCars || [];
const c = (i) => cars[i]?.id || (i + 1);

// NOTE: Backend rule - start date cannot be in the past, max 25 days rental
// Today = 2026-04-07
const rentalList = [];
if (user1Id) {
  rentalList.push({ startDate: '2026-04-07', endDate: '2026-04-12', carId: c(0), userId: user1Id });
  rentalList.push({ startDate: '2026-04-15', endDate: '2026-04-20', carId: c(2), userId: user1Id });
  rentalList.push({ startDate: '2026-05-01', endDate: '2026-05-07', carId: c(4), userId: user1Id });
  rentalList.push({ startDate: '2026-05-20', endDate: '2026-05-25', carId: c(6), userId: user1Id });
  rentalList.push({ startDate: '2026-06-01', endDate: '2026-06-07', carId: c(8), userId: user1Id });
}
if (user2Id) {
  rentalList.push({ startDate: '2026-04-10', endDate: '2026-04-15', carId: c(1), userId: user2Id });
  rentalList.push({ startDate: '2026-04-25', endDate: '2026-05-02', carId: c(3), userId: user2Id });
  rentalList.push({ startDate: '2026-05-10', endDate: '2026-05-14', carId: c(5), userId: user2Id });
  rentalList.push({ startDate: '2026-06-10', endDate: '2026-06-15', carId: c(9), userId: user2Id });
}
if (user3Id) {
  rentalList.push({ startDate: '2026-04-08', endDate: '2026-04-13', carId: c(7), userId: user3Id });
  rentalList.push({ startDate: '2026-04-20', endDate: '2026-04-27', carId: c(10), userId: user3Id });
  rentalList.push({ startDate: '2026-05-15', endDate: '2026-05-20', carId: c(12), userId: user3Id });
}

const createdRentalIds = [];
for (const rental of rentalList) {
  const r = await api('POST', '/api/rentals/add', rental, USER_TOKEN);
  if (r?.id) {
    createdRentalIds.push(r.id);
    console.log(`  OK: Rental #${r.id} Car:${rental.carId} (${rental.startDate} -> ${rental.endDate})`);
  } else {
    console.log(`  Rental response: ${JSON.stringify(r)}`);
  }
}

await sleep(400);
const allRentals = await api('GET', '/api/rentals/getAll', null, ADMIN_TOKEN);
console.log(`  Total rentals: ${allRentals?.length}`);

// ─── STEP 9: Invoices ─────────────────────────────────────────
console.log('\n[9] Creating invoices...');
let invIdx = 1;
for (const r of (allRentals || []).slice(0, 10)) {
  const invNo = `INV-2024-${String(invIdx).padStart(4, '0')}`;
  const disc = Math.floor(Math.random() * 10);
  const inv = await api('POST', '/api/invoices/add', {
    invoiceNo: invNo,
    totalPrice: r.totalPrice || 0,
    discountRate: disc,
    taxRate: 10,
    rentalId: r.id,
  }, ADMIN_TOKEN);
  if (inv) console.log(`  OK: Invoice ${invNo} for Rental #${r.id}`);
  invIdx++;
}

// ─── SUMMARY ─────────────────────────────────────────────────
console.log('\n============================================');
console.log('  SEEDING COMPLETE!');
console.log('============================================');
console.log(`\nData summary:`);
console.log(`  Colors   : ${allColors?.length || 0}`);
console.log(`  Brands   : ${allBrands?.length || 0}`);
console.log(`  Models   : ${allModels?.length || 0}`);
console.log(`  Cars     : ${allCars?.length || 0}`);
console.log(`  Rentals  : ${allRentals?.length || 0}`);
console.log(`  Invoices : ${invIdx - 1}`);
console.log('\nTest accounts:');
console.log('  ADMIN : admin@autohub.vn / Admin@123');
console.log('  USER 1: vana@gmail.com  / User@123');
console.log('  USER 2: bich@gmail.com  / User@123');
console.log('  USER 3: vanc@gmail.com  / User@123');
console.log('\nURLs:');
console.log('  Frontend : http://localhost:3000');
console.log('  Admin    : http://localhost:3000/admin/login');
console.log('  Swagger  : http://localhost:8080/swagger-ui/index.html');
