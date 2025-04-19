# Project-Kresta Guide

## Step 1: Prerequisites

To install Node.js, first download the installer from the [Node.js website](https://nodejs.org/), or use a package manager for your OS. After installation, verify by running the following command in your terminal:

```bash
node -v
npm -v
```

Make sure Git is installed for cloning the repository. Verify by running:
```bash
git --version
```

## Step 2: Clone Repository

To work with the latest version of Project Kresta, clone the repository:
```bash
git clone <repository-url>
cd project-kresta
```

## Step 3: Create .env file

Create a `.env` file to store environment variables. This file should be added to `.gitignore` to avoid it being committed to the repository.
```bash
NODE_ENV = 'development'
```

## Step 4: Install Dependencies

To install the dependencies and devDependencies for this project, run the following commands:

### Dependencies
```bash
npm install axios@^1.8.4 dotenv@^16.5.0 express@^5.1.0 express-session@^1.18.1
```

### Dev Dependencies
```bash
npm install --save-dev browser-sync@^3.0.4 copy-webpack-plugin@^13.0.0 css-loader@^7.1.2 file-loader@^6.2.0 html-webpack-plugin@^5.6.3 mini-css-extract-plugin@^2.9.2 nodemon-webpack-plugin@^4.8.2 sass@^1.86.3 sass-loader@^16.0.5 style-loader@^4.0.0 webpack@^5.99.5 webpack-cli@^6.0.1 webpack-dev-server@^5.2.1
```

## Development Workflow
To use Nodemon for backend development and Webpack for frontend bundling, follow these steps:

### Webpack (Frontend Bundling)
1. Run `npm start` to launch the development server with Webpack Dev Server.
2. Make changes to your files in the `src` directory, and Webpack will automatically bundle and reload the changes.
3. Use `npm run build` only for production builds when project is ready to be deployed.

### Nodemon (Backend Development)
1. Run `npm run dev` in your terminal to start the development server.
2. Make changes to your code and observe how both the server and the build process are updated accordingly.