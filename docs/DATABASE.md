# SaveWise Database

## savings_goals

| Column        | Type      | Description          |
| ------------- | --------- | -------------------- |
| id            | BIGINT    | Primary key          |
| name          | VARCHAR   | Savings goal name    |
| target_amount | DECIMAL(12,2) | Target amount        |
| saved_amount  | DECIMAL(12,2) | Current saved amount (defaults to 0.00) |
| created_at    | TIMESTAMP | Creation date        |
| updated_at    | TIMESTAMP | Last update          |

## Rules

* target_amount must be greater than 0.
* saved_amount must be 0 or greater.
* saved_amount must not exceed target_amount.
* Monetary values must be validated by the backend.

## MySQL configuration

The Laravel backend reads its MySQL configuration from `backend/.env`. The supplied `.env.example` uses database `savewise` on `127.0.0.1:3306` with username `root` and an empty password. Create the `savewise` database, adjust those values if needed, then run `php artisan migrate` from `backend/`.
