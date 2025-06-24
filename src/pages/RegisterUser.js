import React, { useState } from 'react';
import styles from './RegisterUser.module.css';
import { Link, useLocation } from 'react-router-dom';

const RegisterUser = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userRole = queryParams.get("role") || "owner";

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirm_password: '',
    role: userRole
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost/furmaps/backend/register.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      alert("Error connecting to the server");
      console.error(error);
    }
  };
  return (
    <div className={styles.registerWrapper}>
      {/* Top Header */}
      <header className={styles.header}>
        <img src="/images/gps.png" alt="logo" />
        <h1>FurMaps</h1>
      </header>

      {/* Form Section */}
      <section className={styles.registerContainer}>
        <div className={styles.registerSection}>
          <div className={styles.registerIntro}>
            <h2>Welcome to FurMaps</h2>
            <p>Register your account</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <img src="/images/user.png" alt="user icon" />
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Full Name"
              />
            </div>

            <div className={styles.formGroup}>
              <img src="/images/email.png" alt="email icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
              />
            </div>

            <div className={styles.formGroup}>
              <img src="/images/pass.png" alt="password icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
              />
            </div>

            <div className={styles.formGroup}>
              <img src="/images/confirm-pass.png" alt="confirm password icon" />
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm Password"
              />
            </div>

            <button type="submit" className={styles.submitBtn}>Register</button>

            <div className={styles.loginRedirect}>
              Already have a FurMaps account? <Link to="/LoginUser">Sign In</Link>
            </div>
          </form>
        </div>
      </section>

      {/* 🐾 Background banner */}
      <div className={styles.petBannerBackground}></div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div>
          <h3>FurMaps</h3>
          <p>About us</p>
          <p>Help Center</p>
          <p>Terms of Use</p>
          <p>Privacy Policy</p>
        </div>
        <div>
          <h3>Pet Lover</h3>
          <p>Be a Pet Sitter</p>
          <p>Be a Dog Walker</p>
        </div>
        <div>
          <h3>Pet Services</h3>
          <p>Pet Boarding</p>
          <p>Pet Sitting</p>
          <p>Pet Daycare</p>
          <p>Dog Walking</p>
          <p>Pet Grooming</p>
        </div>
        <div>
          <h3>Contact Us</h3>
          <div className={styles.contactItem}>
            <img src="/images/blck-email.png" alt="email icon" />
            <p>Email us</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RegisterUser;
