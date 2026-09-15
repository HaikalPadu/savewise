# SaveWise Architecture

## Overview

SaveWise is a full-stack web application for tracking personal savings goals.

## Application Flow

Browser
↓
React Frontend
↓
REST API
↓
Laravel Backend
↓
MySQL Database

## Frontend

The frontend is responsible for:

* displaying savings goals
* creating savings goals
* adding savings
* displaying progress
* deleting savings goals
* handling user interactions
* displaying errors

## Backend

The backend is responsible for:

* receiving API requests
* validating data
* storing savings goals
* updating saved amounts
* deleting savings goals
* returning JSON responses

## Database

MySQL stores savings goal information.

## Communication

The frontend communicates with the backend through REST API endpoints.

The frontend must not directly communicate with MySQL.
