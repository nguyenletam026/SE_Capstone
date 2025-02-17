FROM maven:3.9.8-amazoncorretto-21 AS build
WORKDIR /app

COPY . .
RUN mvn clean package -DskipTests


# Run stage

FROM amazoncorretto:21.0.4
WORKDIR /app

COPY --from=build /app/target/DrComputer-0.0.1-SNAPSHOT.war drcomputer.war
EXPOSE 8080

ENTRYPOINT ["java","-jar","drcomputer.war"]




