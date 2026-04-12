#!/bin/bash
set -euo pipefail
SQLCMD=/opt/mssql-tools18/bin/sqlcmd
COMMON=( -S "$DB_HOST" -U sa -P "$MSSQL_SA_PASSWORD" -C )

# Không dùng -b: recovery / DB chưa ONLINE có thể làm lệnh lỗi tạm thời.
run_master() {
  "$SQLCMD" "${COMMON[@]}" -d master "$@"
}

echo "Waiting for SQL Server at ${DB_HOST} (login to [master])..."
for i in $(seq 1 90); do
  if run_master -Q "SELECT 1" -o /dev/null 2>/dev/null; then
    echo "SQL Server accepts connections."
    break
  fi
  if [ "$i" -eq 90 ]; then
    echo "Timeout waiting for SQL Server."
    exit 1
  fi
  sleep 2
done

echo "Waiting for server recovery to settle..."
sleep 5

echo "Ensuring database [autohub] exists..."
run_master -b -Q "IF DB_ID(N'autohub') IS NULL CREATE DATABASE [autohub];"

echo "Waiting for [autohub] to be ONLINE (state=0)..."
for i in $(seq 1 60); do
  ST=$(run_master -h -1 -W -Q "SET NOCOUNT ON; SELECT CAST(state AS VARCHAR(2)) FROM sys.databases WHERE name = N'autohub';" 2>/dev/null | tail -n 1 | tr -d '[:space:]' || true)
  if [ "$ST" = "0" ]; then
    echo "Database [autohub] is ONLINE."
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Timeout waiting for [autohub] ONLINE (last state='$ST')."
    exit 1
  fi
  sleep 2
done

# Kiểm tra schema từ [master] — không login -d autohub (tránh 18456 / Msg 904 khi recovery).
set +e
SCHEMA_LINE=$(run_master -h -1 -W -Q "SET NOCOUNT ON; SELECT CASE WHEN EXISTS (SELECT 1 FROM autohub.INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = N'dbo' AND TABLE_NAME = N'roles') THEN 1 ELSE 0 END;" 2>/dev/null | tail -n 1 | tr -d '[:space:]')
set -e
SCHEMA_LINE=${SCHEMA_LINE:-0}

if [ "$SCHEMA_LINE" != "1" ]; then
  echo "Applying /autohub-full-schema.sql (schema + seed)..."
  "$SQLCMD" "${COMMON[@]}" -b -i /autohub-full-schema.sql
  echo "Database [autohub] initialized."
else
  echo "Database [autohub] already has schema; skipping SQL init."
fi
