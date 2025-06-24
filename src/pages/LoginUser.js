// LoginUser.js
import React, { useState } from "react";
import styles from "./LoginUser.module.css";
import { Link } from "react-router-dom";

const LoginUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }
         console.log("Sending login data:", { email, password });
  try {
    const response = await fetch("http://localhost/furmaps/backend/login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
       body: JSON.stringify({
    email: email.trim(),
    password: password,
  }),
    });

    const result = await response.json();
     console.log("Server response:", result);
    if (result.status === "success") {
      alert("Welcome back, " + result.user.name);

      // Optional: store in localStorage or navigate to dashboard
      localStorage.setItem("user", JSON.stringify(result.user));
      // window.location.href = "/dashboard"; // If you have a dashboard route
    } else {
      alert(result.message);
    }
  } catch (err) {
    console.error(err);
    alert("Failed to connect to the server.");
  }
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
           <Link to="/RegisterUser">Register Here</Link>
          </div>
        </div>

        {/* Footer */}
<div className={styles.footer}>
  <div className={styles.footerColumn}>
    <h3>FurMaps</h3>
    {/* Use Link only if routes exist in your router */}
    <Link to="/about">About us</Link>
    <Link to="/help">Help Center</Link>
    <Link to="/terms">Terms of Use</Link>
    <Link to="/privacy">Privacy Policy</Link>
  </div>

  <div className={styles.footerColumn}>
    <h3>Pet Lover</h3>
    <Link to="/be-pet-sitter">Be a Pet Sitter</Link>
    <Link to="/be-dog-walker">Be a Dog Walker</Link>
  </div>

  <div className={styles.footerColumn}>
    <h3>Pet Services</h3>
    <Link to="/boarding">Pet Boarding</Link>
    <Link to="/sitting">Pet Sitting</Link>
    <Link to="/daycare">Pet Daycare</Link>
    <Link to="/grooming">Pet Grooming</Link>
    <Link to="/walking">Dog Walking</Link>
  </div>

  <div className={styles.footerColumn}>
    <h3>Contact Us</h3>
    <Link to="/contact">Email us</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginUser;
