# SaveWise Project Instructions

## Project

SaveWise is a simple full-stack web application for tracking personal savings goals.

Users can:

* create savings goals
* set target amounts
* track saved amounts
* add savings
* view progress
* delete savings goals

## Technology

Frontend:

* React
* Vite
* JavaScript
* CSS

Backend:

* Laravel
* PHP
* REST API

Database:

* MySQL

## Project Structure

frontend/ contains all frontend code.

backend/ contains all backend and API code.

docs/ contains shared project documentation.

## AI Responsibilities

### Codex

Codex is responsible for:

* backend/
* Laravel
* REST API
* database
* backend validation
* backend tests

### Claude

Claude is responsible for:

* frontend/
* React
* Vite
* UI components
* pages
* CSS
* frontend API integration
* frontend tests

## Rules

1. Do not modify the other AI's main area of responsibility.
2. Frontend communicates with the backend through REST APIs.
3. Frontend must never directly access MySQL.
4. Do not invent API endpoints.
5. API changes must be documented in docs/API.md.
6. Database changes must be documented in docs/DATABASE.md.
7. Read the documentation before implementing features.
8. Keep the project simple and beginner-friendly.
9. Avoid unnecessary libraries.
10. Run relevant tests before completing a task.

## Documentation

Architecture:
docs/ARCHITECTURE.md

API:
docs/API.md

Database:
docs/DATABASE.md

Tasks:
docs/TASKS.md
