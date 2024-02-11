# TypeScript Express Starter Project

## Introduction

This starter project is designed for the rapid development and deployment of TypeScript applications with Express. It features authentication support, WebSocket connections, file uploads, and automated Swagger documentation generation.

## Technologies

- **Express.js**: The server foundation.
- **TypeDI**: Dependency injection.
- **Socket.io**: For WebSocket connections.
- **routing-controllers**: For decorators and routing.
- **class-validator-jsonschema**: For validation and JSON schemas.
- **Swagger UI**: For API documentation.

## Project Structure

- `api/*`: API features and controllers.
- `utils`: Utility functions and helpers.
- `middlewares`: Custom Express middlewares.
- `public`: Static files directory.
- `config`: Application configuration files.

## Installation and Setup

Clone the repository, install dependencies with `npm install`, configure your environment variables, and run `npm start` to boot the server.

## Usage

- Authentication: Utilize JWT for secure endpoints.
- File Uploads: Use `multer` for handling file uploads and integrate with AWS S3 for storage.
- WebSocket: Establish real-time communication channels with Socket.io.

## Environment and Configuration

Set environment variables for `PORT` and `NODE_ENV` to configure the application runtime environment.

## Additional Services and Middleware

- `loadHelmet`: For securing Express apps by setting various HTTP headers.
- `bodyParser`: For parsing incoming request bodies.
- `morgan`: For logging HTTP requests.
- `cors`: For enabling CORS (Cross-Origin Resource Sharing).

## Swagger API Documentation

Access the Swagger UI to view and test the API at `http://localhost:3000/docs/`.

## WebSocket and Socket.io

Details on establishing and using WebSocket connections through Socket.io, including authentication and event handling.

### Token Authentication

To authenticate a WebSocket connection, the client must provide a valid JWT token in the query string of the connection URL. The server will then verify the token and authenticate the connection.

Example of url: `http://localhost:3000/?authToken`

## Authentication and Security

Explanation of how the authentication system processes tokens and what security measures are in place
