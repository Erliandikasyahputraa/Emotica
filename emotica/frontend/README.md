# Emotica Frontend

Frontend application for Emotica - A Text Sentiment Analysis Tool

## Features

- Modern, responsive UI built with React and Tailwind CSS
- User authentication (login/register)
- Text sentiment analysis
- Analysis history
- Dark/Light mode
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory and add your API URL:

```
VITE_API_URL=http://localhost:5000/api/v1
```

3. Start the development server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── public/          # Static files
├── src/
│   ├── assets/      # Images, fonts, etc.
│   ├── components/   # Reusable UI components
│   ├── context/      # React context providers
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components
│   ├── services/     # API service functions
│   ├── styles/       # Global styles
│   ├── utils/        # Utility functions
│   ├── App.jsx       # Main App component
│   └── main.jsx      # Application entry point
└── index.html        # HTML template
```

## Environment Variables

- `VITE_API_URL` - Backend API base URL

## Building for Production

To create a production build:

```bash
npm run build
```

This will create a `dist` folder with the production-ready files.

## License

MIT
