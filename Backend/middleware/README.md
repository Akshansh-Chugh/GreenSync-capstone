# Middleware

This folder contains Express middleware that runs between route matching and controller execution.

## Current Files

- `auth.middleware.js` validates owner JWT authentication.
- `care.auth.middleware.js` is intended for caretaker authentication.
- `multerMiddleware.js` handles multipart file uploads.

## Role in the Backend

Middleware is used for cross-cutting concerns such as authentication, authorization, file parsing, and request preparation.

Middleware are different from common utilties of project