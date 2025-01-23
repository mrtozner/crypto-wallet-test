# Backend Service

## Features

- **REST API** for managing alerts, wallets, and transactions
- **MongoDB** as the database for persistent storage
- **Redis** for caching
- **Express Validator** for request validation
- **Node Cron** for task scheduling

---

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Docker and Docker Compose

---

### Installation

1. **Setup environment variables in backend folder (if not exist)**:
   Create a `.env` file in the root directory and add the required variables. Example:
    ```env
   NODE_ENV=local
   PORT=80
   DATABASE=mongodb://mongo:27017/crypto_wallet
   REDIS=redis://redis:6379
   CRON=1
    ```

2. **Run the application**:
      ```bash
      docker-compose up --d
      ```

3. **Run tests**:
    ```bash
    npm test
    ```

---

## Docker Setup

### Build and Run Services
1. **Start the Docker Compose environment**:
    ```bash
    docker-compose up -d --build
    ```

2. The services include:
    - **Backend**
    - **MongoDB**
    - **Redis**

---

## API Endpoints

### Base URL

`http://localhost:80/api`

### Health Check
- **GET** `/health`: Check if the service is running.

### Alerts
- **GET** `/alert`: List all alerts (with optional filters and pagination)
- **GET** `/alert/:id`: Get alert by ID

### Wallets
- **GET** `/wallet/:id`: Get wallet by ID
- **GET** `/wallet/by-address/:address`: Get wallet by address

### Transactions
- **GET** `/transaction`: List transactions (with optional filters).
- **GET** `/transaction/:id`: Get transaction by ID

---

## Validation

Request data is validated using **Express Validator**. Validation rules are defined in `domain/validations/`.

---

## Scripts

- **`npm start`**: Start the development server.
- **`npm run build`**: Build the project for production
- **`npm run start-prod`**: Start the production server
- **`npm test`**: Run tests.
- **`npm run watch`**: Start development server with file watching (ndoemon)

---

## Dependencies

### Core
- `express`: Web framework
- `mongoose`: MongoDB ODM
- `redis`: Redis client
- `dotenv`: Environment variable management

### Validation & Testing
- `express-validator`: Request validation
- `jest`: Testing framework

### Utilities
- `node-cron`: Task scheduling

### Development
- `@babel/core`, `@babel/node`: ES6+ support
- `nodemon`: Automatic restarts for development
