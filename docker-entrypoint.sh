#!/bin/sh
# Convert DATABASE_URL from postgres:// to jdbc:postgresql://
if [ -n "$DATABASE_URL" ]; then
  export SPRING_DATASOURCE_URL=$(echo $DATABASE_URL | sed 's/^postgres:/jdbc:postgresql:/')
fi

# Start the application
exec java -Dserver.port=${PORT:-8080} -jar app.jar
