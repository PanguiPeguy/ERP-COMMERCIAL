# ==================================================
# BUILD STAGE
# ==================================================
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copier uniquement le pom.xml
COPY pom.xml .

# Télécharger les dépendances Maven
RUN mvn dependency:go-offline

# Copier le code source
COPY src ./src

# Compiler le projet
RUN mvn clean package -DskipTests

# ==================================================
# RUNTIME STAGE
# ==================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copier le jar généré
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]