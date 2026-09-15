# SaveWise API

## Base URL

/api

For local Vite development, the backend permits requests from `http://localhost:5173` and `http://127.0.0.1:5173`.

## Savings Goals

### GET /api/goals

Returns all savings goals.

Response (`200 OK`):

```json
{
    "data": [
        {
            "id": 1,
            "name": "New Laptop",
            "target_amount": "4000.00",
            "saved_amount": "0.00",
            "created_at": "2026-09-15T00:00:00.000000Z",
            "updated_at": "2026-09-15T00:00:00.000000Z"
        }
    ]
}
```

### POST /api/goals

Creates a new savings goal.

Request:

```json
{
    "name": "New Laptop",
    "target_amount": 4000
}
```

The initial saved_amount should be 0.

Response: `201 Created` with the created goal in a `data` object. Monetary values are returned as two-decimal strings.

### PUT /api/goals/{id}/add-savings

Adds money to a savings goal.

Request:

```json
{
    "amount": 200
}
```

The backend must ensure that the resulting saved amount does not exceed the target amount.

Response: `200 OK` with the updated goal in a `data` object. If the addition would exceed the target, the API returns `422 Unprocessable Entity` with an `errors.amount` message.

### DELETE /api/goals/{id}

Deletes a savings goal.

Response: `204 No Content`.

## Responses

The API should return JSON responses.

Validation errors should return an appropriate HTTP status code and useful error information.

All successful goal responses use a top-level `data` key. Validation failures return `422 Unprocessable Entity` with Laravel's JSON `message` and `errors` fields. Goal names are required strings up to 255 characters; monetary inputs must be positive values with no more than two decimal places.
