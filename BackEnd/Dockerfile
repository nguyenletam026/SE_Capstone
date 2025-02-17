# Build stage
FROM maven:3.9.8-amazoncorretto-21 AS build
WORKDIR /app

# Copy only the necessary files first (better for caching)
COPY pom.xml ./
RUN mvn dependency:go-offline

# Copy the rest of the source code
COPY src ./src
COPY resources ./resources

# Run Maven build
RUN mvn clean package -DskipTests

# Run stage
FROM amazoncorretto:21.0.4
WORKDIR /app

# Copy the built artifact from the build stage
COPY --from=build /app/target/*.war drcomputer.war

# Expose port 8080 (documenting, not opening)
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "drcomputer.war"]
