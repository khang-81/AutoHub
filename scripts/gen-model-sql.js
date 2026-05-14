const m = [
  ['VinFast', 'VF 3'],
  ['VinFast', 'VF 8'],
  ['VinFast', 'VF 9'],
  ['Toyota', 'Corolla Cross'],
  ['Toyota', 'Fortuner'],
  ['Honda', 'Civic'],
  ['Honda', 'CR-V'],
  ['Mazda', 'Mazda3'],
  ['Mazda', 'BT-50'],
  ['Mercedes-Benz', 'C-Class'],
  ['Mercedes-Benz', 'E-Class'],
  ['Mercedes-Benz', 'GLC'],
];
for (const [b, md] of m) {
  console.log(
    `IF NOT EXISTS (SELECT 1 FROM [dbo].[models] m INNER JOIN [dbo].[brands] b ON m.[brand_id] = b.[id] WHERE b.[name] = N'${b}' AND m.[name] = N'${md}')\n` +
      `    INSERT INTO [dbo].[models] ([created_date], [name], [brand_id])\n` +
      `    SELECT CAST(GETDATE() AS DATE), N'${md}', [id] FROM [dbo].[brands] WHERE [name] = N'${b}';`
  );
}
