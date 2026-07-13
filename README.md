# Habitat Vibecode

A multi-module project with a React frontend and a Spring Boot backend.

## Modules

*   `frontend`: A React application.
*   `backend`: A Spring Boot application that serves the frontend and provides a REST API.

## Prerequisites

*   Java 8 or later
*   Node.js and npm
*   Maven

## Building the Project

To build the entire project, run the following command from the root directory:

```bash
mvn clean install
```

This will:

1.  Build the React frontend.
2.  Copy the frontend build artifacts to the `backend` module's `src/main/resources/static` directory.
3.  Build the Spring Boot backend.

## Running the Application

To run the backend application, use the following command:

```bash
mvn spring-boot:run -pl backend
```

The application will be available at `http://localhost:8080`.

## Development

### Frontend

To start the frontend development server, navigate to the `frontend` directory and run:

```bash
npm start
```

The frontend will be available at `http://localhost:3000`.

### Backend

You can run the backend in your IDE or by using the `mvn spring-boot:run` command as described above.
