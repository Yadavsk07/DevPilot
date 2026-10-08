# ==========================================
# Stage 1 - Build
# ==========================================

FROM eclipse-temurin:25-jdk AS build

WORKDIR /app

# Copy Maven wrapper and configuration first
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw -B dependency:go-offline

# Copy source
COPY src src

# Build application
RUN ./mvnw -B clean package -DskipTests


# ==========================================
# Stage 2 - Runtime
# ==========================================

FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]