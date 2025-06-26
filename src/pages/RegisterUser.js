// RegisterUser.js
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useLocation, Link } from 'react-router-dom';
import styles from './RegisterUser.module.css';

const RegisterUser = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userRole = queryParams.get("role") || "owner";

  const [formData, setFormData] = useState({
    full_name: '',
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

  // 1. Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
});

if (error) {
  alert(error.message);
  return;
}

if (!data.session) {
  alert("Please verify your email first before continuing.");
  return;
}

const userId = data.user.id; // Safe now

const { error: insertError } = await supabase.from("profiles").insert([
  {
    id: userId,
    full_name: formData.full_name,
    role: formData.role,
  }
]);

if (insertError) {
  alert("Failed to save user profile: " + insertError.message);
} else {
  alert("Registered successfully!");
}

};
  // 2. Insert additional user info into 'profiles' table
  /*const { user } = data;
  const { error: profileError } = await supabase
    .from("profiles")
    .insert([
      {
        user_id: user.id, // match your column name in 'profiles'
        full_name: formData.full_name,
        role: formData.role,
      },
    ]);
  if (profileError) {
    alert(profileError.message);
  } else {
    alert("Registered successfully!");
    // You can also redirect here if needed
    // window.location.href = "/LoginUser";
  }
};*/

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
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Full Name"
                required
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
                required
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
                required
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
                required
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
