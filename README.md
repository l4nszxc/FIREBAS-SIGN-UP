# Firebase Signup Application

A simple web application demonstrating Firebase authentication with signup functionality, built using Express.js backend and vanilla JavaScript frontend.

## Features

- 🔐 Firebase Authentication integration
- 📱 Responsive web design
- 🚀 Express.js backend server
- 🔒 Environment variable security
- 📊 Real-time user authentication

## Technologies Used

- **Backend**: Node.js with Express.js
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Authentication**: Firebase Auth
- **Styling**: Custom CSS
- **Development**: Nodemon for hot reloading

## Project Structure

```
├── public/
│   ├── index.html      # Main HTML file
│   ├── script.js       # Frontend JavaScript
│   └── style.css       # Styling
├── server.js           # Express server
├── package.json        # Dependencies
└── .env               # Environment variables (not tracked)
```

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TRY-SIGN-UP-USING-FIREBASE.git
   cd TRY-SIGN-UP-USING-FIREBASE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create a `.env` file in the root directory with your Firebase configuration:
   ```env
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   FIREBASE_MEASUREMENT_ID=your_measurement_id
   PORT=3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (placeholder)

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication with Email/Password provider
4. Get your web app configuration
5. Update the `.env` file with your Firebase config

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

Created as a demonstration of Firebase authentication integration with Express.js.
