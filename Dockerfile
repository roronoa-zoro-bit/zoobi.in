FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY server-spring/pom.xml ./server-spring/
COPY server-spring/mvnw ./server-spring/
COPY server-spring/mvnw.cmd ./server-spring/
COPY server-spring/.mvn ./server-spring/.mvn
COPY server-spring/src ./server-spring/src
WORKDIR /app/server-spring
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/server-spring/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
