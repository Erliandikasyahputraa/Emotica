# Emotica Backend

Backend API for Emotica - A Text Sentiment Analysis Application

## Features

- User authentication (JWT)
- Text sentiment analysis
- Analysis history tracking
- RESTful API endpoints
- MongoDB integration
- Error handling
- Input validation
- API documentation (Swagger)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add the following:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/emotica
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=30d
```

4. Start the development server:

```bash
npm run dev
```

## API Documentation

Once the server is running, you can access the API documentation at:

- Swagger UI: `http://localhost:5000/api-docs`
- API Base URL: `http://localhost:5000/api/v1`

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Environment Variables

- `NODE_ENV` - Application environment (development/production)
- `PORT` - Port to run the server on
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `JWT_EXPIRES_IN` - JWT expiration time

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   └── server.js       # Application entry point
├── tests/             # Test files
└── .env               # Environment variables
```

## License

MIT
