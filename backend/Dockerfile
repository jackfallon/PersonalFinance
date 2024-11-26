FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 5454
ENTRYPOINT ["java","-jar","app.jar"]