// LoginUser.js
import React, { useState } from "react";
import styles from "./LoginUser.module.css";

const LoginUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    
   <div
  className={styles.loginWrapper}
  style={{
    backgroundImage: "url('/images/dog-background.png')",
    backgroundSize: "cover",            // Fills the screen
    backgroundPosition: "top center",   // Shift image upward (less zoomed look)
    backgroundRepeat: "no-repeat",
    backgroundColor: "#fae6c3",         // Fallback color
  }}
>


      {/* Overlay to improve readability */}
      <div className={styles.overlay}>
        {/* Top Bar */}
        <div className={styles.navbar}>
          <img className={styles.logo} src="/images/gps.png" alt="Logo" />
          <div className={styles.brand}>FurMaps</div>
        </div>

        {/* Login Form */}
        <div className={styles.formContainer}>
          <h1>
            Welcome to <span>FurMaps</span>
          </h1>
          <p className={styles.subHeader}>Log In to Continue</p>

          <label>Email</label>
          <div className={styles.inputGroup}>
            <img src="/images/email.png" alt="email" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label>Password</label>
          <div className={styles.inputGroup}>
            <img src="/images/pass.png" alt="password" />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className={styles.loginButton} onClick={handleLogin}>
            Log In
          </button>

          <div className={styles.register}>
            <span>Don’t have an account yet?</span>
            <a href="#">Register Here</a>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerColumn}>
            <h3>FurMaps</h3>
            <a href="#">About us</a>
            <a href="#">Help Center</a>
            <a href="#">Terms of Use</a>
            <a href="#">Privacy Policy</a>
          </div>
          <div className={styles.footerColumn}>
            <h3>Pet Lover</h3>
            <a href="#">Be a Pet Sitter</a>
            <a href="#">Be a Dog Walker</a>
          </div>
          <div className={styles.footerColumn}>
            <h3>Pet Services</h3>
            <a href="#">Pet Boarding</a>
            <a href="#">Pet Sitting</a>
            <a href="#">Pet Daycare</a>
            <a href="#">Pet Grooming</a>
            <a href="#">Dog Walking</a>
          </div>
          <div className={styles.footerColumn}>
            <h3>Contact Us</h3>
            <a href="#">Email us</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginUser;
