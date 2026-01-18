#!/bin/sh
# Convert DATABASE_URL from postgres:// to jdbc:postgresql://
if [ -n "$DATABASE_URL" ]; then
  JDBC_DATABASE_URL=$(echo $DATABASE_URL | sed 's/^postgres:/jdbc:postgresql:/')
  exec java -Dserver.port=${PORT:-8080} -Dspring.datasource.url="$JDBC_DATABASE_URL" -jar app.jar
else
  exec java -Dserver.port=${PORT:-8080} -jar app.jar
fi

