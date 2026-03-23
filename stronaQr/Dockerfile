FROM gradle:8.10-jdk21 AS builder
WORKDIR /app

COPY stronaQr/gradlew stronaQr/gradlew
COPY stronaQr/gradle stronaQr/gradle
COPY stronaQr/build.gradle stronaQr/settings.gradle ./stronaQr/
COPY stronaQr/src stronaQr/src

WORKDIR /app/stronaQr
RUN chmod +x gradlew && ./gradlew clean build -DskipTests --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/stronaQr/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
