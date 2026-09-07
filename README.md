# Project Kresta — Social Media Workspace Platform

Project Kresta is a modern collaborative platform designed for creative teams and social media managers. It provides a unified workspace for organizing content, managing media, and integrating social media tools — powered by a Node.js backend, MongoDB, Cloudinary, and the Instagram Graph API.

---

## Important Note

This build does not function in production because Facebook and Instagram OAuth require strict verification, approved redirect domains, and full compliance with Meta’s platform policies.  
Project Kresta is presented as a **concept prototype** demonstrating backend architecture, API integration structure, and workspace features, but it is **not a deployable production application**.

---

## Walkthrough Video

Watch the full walkthrough of Project Kresta here:

[Project Kresta Walkthrough](https://youtu.be/fkB6EdH3HMw)

---

## About the Platform

Project Kresta centralizes social media workflow into one organized environment. Users can upload media, manage content, connect their Instagram accounts, and collaborate within a structured workspace. The backend handles authentication, media storage, API communication, and secure session management.

### Features

- Instagram Graph API integration  
- Cloudinary media storage  
- User authentication and session management  
- Workspace organization for teams  
- Tools for drafting and preparing social media posts  
- MongoDB database for users, sessions, and media metadata  
- Modular backend architecture using Express and Mongoose  
- Frontend bundling and optimization with Webpack  

---

## How It Works

1. Create an account and log in.  
2. Connect your Instagram profile through Facebook OAuth.  
3. Upload media to Cloudinary or import existing Instagram posts.  
4. Organize content inside your workspace.  
5. Draft posts and attach media.  
6. Collaborate with your team.  
7. Manage all social media assets in one place.

---

## Tech Stack

- Backend: Node.js, Express  
- Database: MongoDB, Mongoose  
- Authentication: JWT, Express-Session, Facebook OAuth  
- Media: Cloudinary  
- API: Instagram Graph API  
- Frontend: Webpack, HTML/CSS/JS  
- Development Tools: Nodemon, Webpack Dev Server  

---

## Project Structure

```
project-kresta/
├── src/                   # Frontend source code
├── controllers/           # Route controllers
├── config/                # Environment and service configs
├── middleware/            # Authentication and validation middleware
├── models/                # Mongoose schemas
├── routes/                # Express routes
├── utils/                 # Helper utilities
├── .env                   # Environment variables
├── package.json
├── app.js
└── README.md
```

---

## License

This project is licensed under the ISC License.
