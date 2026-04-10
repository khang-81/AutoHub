#!/bin/bash
set -euo pipefail
SQLCMD=/opt/mssql-tools18/bin/sqlcmd

echo "Waiting for SQL Server at ${DB_HOST}..."
for i in $(seq 1 90); do
  if "$SQLCMD" -S "$DB_HOST" -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" -b -o /dev/null 2>/dev/null; then
    echo "SQL Server is up."
    break
  fi
  if [ "$i" -eq 90 ]; then
    echo "Timeout waiting for SQL Server."
    exit 1
  fi
  sleep 2
done

"$SQLCMD" -S "$DB_HOST" -U sa -P "$MSSQL_SA_PASSWORD" -Q "IF DB_ID('rentacar') IS NULL CREATE DATABASE rentacar;"
echo "Database rentacar is ready."
