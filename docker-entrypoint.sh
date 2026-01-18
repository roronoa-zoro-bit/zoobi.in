#!/bin/sh
set -e

# Convert DATABASE_URL to JDBC format and extract credentials
if [ -n "$DATABASE_URL" ]; then
  # Convert postgres:// to jdbc:postgresql://
  JDBC_URL=$(echo "$DATABASE_URL" | sed 's|^postgres://|jdbc:postgresql://|')
  
  # Extract username from URL (between // and :)
  DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
  
  # Extract password from URL (between : and @)
  DB_PASS=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
  
  echo "Starting with JDBC URL: ${JDBC_URL}"
  exec java \
    -Dserver.port="${PORT:-8080}" \
    -Dspring.datasource.url="${JDBC_URL}" \
    -Dspring.datasource.username="${DB_USER}" \
    -Dspring.datasource.password="${DB_PASS}" \
    -jar app.jar
else
  echo "No DATABASE_URL found, starting with default config"
  exec java -Dserver.port="${PORT:-8080}" -jar app.jar
fi
