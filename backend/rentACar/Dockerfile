# Build JAR then run with JRE (profile prod — env từ docker-compose)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-jammy
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
RUN mkdir -p /app/uploads
COPY --from=build /app/target/rentACar-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
# Render/Railway set PORT; prod profile trong env (SPRING_PROFILES_ACTIVE=prod)
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
ENTRYPOINT ["java", "-jar", "app.jar"]
