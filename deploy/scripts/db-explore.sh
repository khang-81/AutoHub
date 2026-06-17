#!/usr/bin/env bash
# db-explore.sh — tra cuu DB autohub trong Docker, output dang bang co header.
#
# Usage:
#   bash deploy/scripts/db-explore.sh              # danh sach bang + so dong + cot
#   bash deploy/scripts/db-explore.sh rentals      # TOP 20 dong (co header)
#   bash deploy/scripts/db-explore.sh rentals 50
#   bash deploy/scripts/db-explore.sh --all        # TOP 5 moi bang (co header)
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "${REPO_DIR}"

TABLE="${1:-}"
LIMIT="${2:-20}"
MODE="${TABLE}"

run_sql() {
  local file="$1"
  docker compose cp "${file}" sqlserver:/tmp/db-explore.sql
  docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -i /tmp/db-explore.sql'
}

get_tables() {
  docker compose exec -T sqlserver bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -h -1 -W -Q "SET NOCOUNT ON; USE autohub; SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='"'"'BASE TABLE'"'"' AND TABLE_SCHEMA='"'"'dbo'"'"' ORDER BY TABLE_NAME;"' \
    | tr -d '\r' | grep -E '^[a-zA-Z_][a-zA-Z0-9_]*$' || true
}

SQL_FILE="/tmp/db-explore.sql"

if [[ "${MODE}" == "--all" ]]; then
  cat > "${SQL_FILE}" <<'EOF'
USE autohub;
SET NOCOUNT ON;
PRINT '=== TAT CA BANG (so dong) ===';
SELECT
  t.TABLE_NAME AS [table],
  p.rows       AS [row_count]
FROM INFORMATION_SCHEMA.TABLES t
JOIN sys.tables st ON st.name = t.TABLE_NAME
JOIN sys.partitions p ON p.object_id = st.object_id AND p.index_id IN (0,1)
WHERE t.TABLE_TYPE = 'BASE TABLE' AND t.TABLE_SCHEMA = 'dbo'
ORDER BY t.TABLE_NAME;
GO
EOF
  run_sql "${SQL_FILE}"

  while IFS= read -r T; do
    [[ -z "${T}" ]] && continue
    cat > "${SQL_FILE}" <<EOF
USE autohub;
SET NOCOUNT ON;
PRINT '';
PRINT '=== ${T} (TOP 5) ===';
IF COL_LENGTH('dbo.${T}', 'id') IS NOT NULL
  EXEC('SELECT TOP 5 * FROM [dbo].[${T}] ORDER BY id');
ELSE
  EXEC('SELECT TOP 5 * FROM [dbo].[${T}]');
GO
EOF
    run_sql "${SQL_FILE}"
  done < <(get_tables)

elif [[ -n "${TABLE}" ]]; then
  if [[ ! "${TABLE}" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
    echo "ERROR: invalid table name: ${TABLE}"
    exit 1
  fi
  cat > "${SQL_FILE}" <<EOF
USE autohub;
SET NOCOUNT ON;
PRINT '=== COT: ${TABLE} ===';
SELECT c.ORDINAL_POSITION AS [#], c.COLUMN_NAME, c.DATA_TYPE, c.IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS c
WHERE c.TABLE_SCHEMA = 'dbo' AND c.TABLE_NAME = '${TABLE}'
ORDER BY c.ORDINAL_POSITION;
GO
PRINT '';
PRINT '=== DU LIEU: ${TABLE} (TOP ${LIMIT}) ===';
IF COL_LENGTH('dbo.${TABLE}', 'id') IS NOT NULL
  EXEC('SELECT TOP ${LIMIT} * FROM [dbo].[${TABLE}] ORDER BY id DESC');
ELSE
  EXEC('SELECT TOP ${LIMIT} * FROM [dbo].[${TABLE}]');
GO
EOF
  run_sql "${SQL_FILE}"
else
  cat > "${SQL_FILE}" <<'EOF'
USE autohub;
SET NOCOUNT ON;
PRINT '=== TAT CA BANG ===';
SELECT
  t.TABLE_NAME AS [table],
  p.rows       AS [row_count]
FROM INFORMATION_SCHEMA.TABLES t
JOIN sys.tables st ON st.name = t.TABLE_NAME
JOIN sys.partitions p ON p.object_id = st.object_id AND p.index_id IN (0,1)
WHERE t.TABLE_TYPE = 'BASE TABLE' AND t.TABLE_SCHEMA = 'dbo'
ORDER BY t.TABLE_NAME;
GO
PRINT '';
PRINT '=== CAU TRUC COT ===';
SELECT
  c.TABLE_NAME,
  c.ORDINAL_POSITION AS [#],
  c.COLUMN_NAME,
  c.DATA_TYPE,
  c.IS_NULLABLE AS [nullable]
FROM INFORMATION_SCHEMA.COLUMNS c
WHERE c.TABLE_SCHEMA = 'dbo'
  AND c.TABLE_NAME IN (
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'
  )
ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;
GO
EOF
  run_sql "${SQL_FILE}"
fi

rm -f "${SQL_FILE}"
