# Project Kresta

A modern collaborative platform for creative teams.

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: Download from the [Node.js website](https://nodejs.org/) or install via your OS package manager.
- **npm**: Comes with Node.js.
- **Git**: Download from [git-scm.com](https://git-scm.com/) or install via your OS package manager.

Verify installations:
```bash
node -v
npm -v
git --version
```

---

### 2. Clone the Repository

```bash
git clone <repository-url>
cd project-kresta
```

---

### 3. Environment Variables

Create a `.env` file in the root directory for environment variables.  
**Example:**
```env
NODE_ENV="development"
PORT=5000

MONGO_URI=your-mongo-uri
SESSION_SECRET=your-session-secret
SECRET_KEY=your-secret-key

CLOUD_NAME=your-cloud-name
CLOUD_API_KEY=your-cloud-api-key
CLOUD_API_SECRET=your-cloud-api-secret

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
REDIRECT_URI=your-redirect-uri
```


---

### 4. Install Dependencies

#### Main Dependencies
```bash
npm install
```
Or, to install specific versions:
```bash
npm install axios@^1.8.4 bcrypt@^6.0.0 cloudinary@^2.6.1 connect-mongo@^5.1.0 cors@^2.8.5 crypto-js@^4.2.0 dotenv@^16.5.0 express@^5.1.0 express-session@^1.18.1 jsonwebtoken@^9.0.2 mongoose@^8.14.3 multer@^2.0.0 path@^0.12.7
```

#### Development Dependencies
```bash
npm install --save-dev browser-sync@^3.0.4 copy-webpack-plugin@^13.0.0 css-loader@^7.1.2 html-loader@^5.1.0 html-webpack-plugin@^5.6.3 mini-css-extract-plugin@^2.9.2 nodemon-webpack-plugin@^4.8.2 sass@^1.86.3 sass-loader@^16.0.5 style-loader@^4.0.0 webpack@^5.99.6 webpack-cli@^6.0.1 webpack-dev-server@^5.2.1
```

---

## 🛠 Development Workflow

### Frontend (Webpack)

- **Start Dev Server:**  
  ```bash
  npm start
  ```
  This launches the Webpack Dev Server. Edit files in `src/` and see live reloads.

- **Production Build:**  
  ```bash
  npm run build
  ```
  Bundles your app for deployment.

### Backend (Nodemon)

- **Start Backend Dev Server:**  
  ```bash
  npm run dev
  ```
  Runs your backend with hot-reloading via Nodemon.

---

## 📁 Project Structure

```
project-kresta/
├── src/                   # Source code (frontend)
├── controllers/           # Express route 
├── config/                # Configuration files 
├── middleware/            # Express middleware
├── models/                # Mongoose models
├── routes/                # Express route 
├── utils/                 # Utility/helper 
├── .env                   # Environment variables
├── package.json
├── app.js
└── README.md

```
---