# db-explore.ps1 — tra cuu toan bo bang trong DB autohub (Docker, Windows).
#
# Usage:
#   .\deploy\scripts\db-explore.ps1              # danh sach bang + so dong + cot
#   .\deploy\scripts\db-explore.ps1 rentals      # xem TOP 20 dong bang rentals
#   .\deploy\scripts\db-explore.ps1 rentals 50   # xem TOP 50 dong
#   .\deploy\scripts\db-explore.ps1 -All         # tom tat + TOP 5 moi bang

param(
    [string]$Table = "",
    [int]$Limit = 20,
    [switch]$All
)

$ErrorActionPreference = "Stop"
$RepoDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location $RepoDir

$SqlFile = Join-Path $env:TEMP "autohub-db-explore.sql"

if ($All) {
    @'
USE autohub;
GO
PRINT '=== TAT CA BANG (so dong) ===';
SELECT t.TABLE_SCHEMA AS [schema], t.TABLE_NAME AS [table], p.rows AS [row_count]
FROM INFORMATION_SCHEMA.TABLES t
JOIN sys.tables st ON st.name = t.TABLE_NAME
JOIN sys.partitions p ON p.object_id = st.object_id AND p.index_id IN (0,1)
WHERE t.TABLE_TYPE = 'BASE TABLE' AND t.TABLE_SCHEMA = 'dbo'
ORDER BY t.TABLE_NAME;
GO
'@ | Set-Content -Path $SqlFile -Encoding ASCII

    docker compose cp $SqlFile "sqlserver:/tmp/db-explore.sql"
    $tablesRaw = docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -h -1 -W -Q "USE autohub; SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='"'"'BASE TABLE'"'"' AND TABLE_SCHEMA='"'"'dbo'"'"' ORDER BY TABLE_NAME;"'
    $tables = ($tablesRaw -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -match '^[a-zA-Z_]' })

    foreach ($t in $tables) {
        Add-Content -Path $SqlFile -Value @"

PRINT '';
PRINT '--- $t (TOP 5) ---';
SELECT TOP 5 * FROM [dbo].[$t] ORDER BY id;
GO
"@ -Encoding ASCII
    }
}
elseif ($Table) {
    if ($Table -notmatch '^[a-zA-Z_][a-zA-Z0-9_]*$') { throw "Invalid table name: $Table" }
    @"
USE autohub;
GO
PRINT '=== COT CUA BANG: $Table ===';
SELECT c.COLUMN_NAME, c.DATA_TYPE, c.CHARACTER_MAXIMUM_LENGTH, c.IS_NULLABLE, c.COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS c
WHERE c.TABLE_SCHEMA = 'dbo' AND c.TABLE_NAME = '$Table'
ORDER BY c.ORDINAL_POSITION;
GO
PRINT '';
PRINT '=== DU LIEU: $Table (TOP $Limit) ===';
SELECT TOP $Limit * FROM [dbo].[$Table] ORDER BY id;
GO
"@ | Set-Content -Path $SqlFile -Encoding ASCII
}
else {
    @'
USE autohub;
GO
PRINT '=== TAT CA BANG TRONG autohub ===';
SELECT t.TABLE_SCHEMA AS [schema], t.TABLE_NAME AS [table], p.rows AS [row_count]
FROM INFORMATION_SCHEMA.TABLES t
JOIN sys.tables st ON st.name = t.TABLE_NAME
JOIN sys.partitions p ON p.object_id = st.object_id AND p.index_id IN (0,1)
WHERE t.TABLE_TYPE = 'BASE TABLE' AND t.TABLE_SCHEMA = 'dbo'
ORDER BY t.TABLE_NAME;
GO
PRINT '';
PRINT '=== CAU TRUC COT TUNG BANG ===';
SELECT c.TABLE_NAME, c.ORDINAL_POSITION AS pos, c.COLUMN_NAME, c.DATA_TYPE,
  CASE
    WHEN c.CHARACTER_MAXIMUM_LENGTH IS NOT NULL THEN CAST(c.CHARACTER_MAXIMUM_LENGTH AS VARCHAR(10))
    WHEN c.NUMERIC_PRECISION IS NOT NULL THEN CAST(c.NUMERIC_PRECISION AS VARCHAR(10)) + ',' + CAST(c.NUMERIC_SCALE AS VARCHAR(10))
    ELSE ''
  END AS [size],
  c.IS_NULLABLE AS nullable
FROM INFORMATION_SCHEMA.COLUMNS c
JOIN INFORMATION_SCHEMA.TABLES t ON t.TABLE_SCHEMA = c.TABLE_SCHEMA AND t.TABLE_NAME = c.TABLE_NAME
WHERE t.TABLE_TYPE = 'BASE TABLE' AND c.TABLE_SCHEMA = 'dbo'
ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;
GO
'@ | Set-Content -Path $SqlFile -Encoding ASCII
}

docker compose cp $SqlFile "sqlserver:/tmp/db-explore.sql"
docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -i /tmp/db-explore.sql -y 0'
Remove-Item -Force $SqlFile
