FROM gradle:8.10-jdk21 AS builder
WORKDIR /app

COPY stronaQr/gradlew stronaQr/gradlew
COPY stronaQr/gradle stronaQr/gradle
COPY stronaQr/build.gradle stronaQr/settings.gradle ./stronaQr/
COPY stronaQr/src stronaQr/src

WORKDIR /app/stronaQr
RUN chmod +x gradlew && ./gradlew clean build -x test --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/stronaQr/build/libs/*.jar app.jar

ENV SERVER_PORT=8080
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
