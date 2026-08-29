# CodeAlpha Social Media Platform

A full-stack social media platform developed using Node.js, Express.js, MongoDB, Mongoose, and EJS.

## Features

- User registration
- User login and logout
- Password hashing using bcrypt
- Session-based authentication
- Create posts
- View posts
- Edit own posts
- Delete own posts
- Like and unlike posts
- Add comments to posts
- Follow users
- View users
- User profile
- Edit profile
- Followers and following count
- Responsive CSS styling

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- EJS
- HTML
- CSS
- JavaScript
- bcrypt
- express-session

## Project Structure

```

CodeAlpha_SocialMediaPlatform/
│
├── Models/
│   ├── User.js
│   ├── Post.js
│   ├── Follow.js
│   ├── Comment.js
│   └── Like.js
│
├── public/
│   └── style.css
│
├── views/
│   ├── home.ejs
│   ├── index.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── users.ejs
│   ├── profile.ejs
│   ├── editProfile.ejs
│   └── editPost.ejs
│
├── app.js
├── package.json
├── package-lock.json
└── .gitignore
```


## How to Run

1. Install Node.js and MongoDB.
2. Run `npm install`.
3. Make sure MongoDB is running.
4. Run `node app.js`.
5. Open `http://localhost:8000` in your browser.

## Author

Aditya Saxena

Developed as part of the CodeAlpha Full Stack Development Internship.
