// LoginUser.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from './LoginUser.module.css';
import { Link, useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import Toast from '../components/Toast';

const LoginUser = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Show loading screen for 1.5 seconds when component mounts
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

 const handleLogin = async () => {
  if (!email || !password) return alert("Email and password required.");

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error && error.message.includes("Email not confirmed")) {
      return alert("📧 Please confirm your email before logging in.");
    }

    if (error) throw error;

    const user = data.user;
    console.log("✅ Logged in user:", user);

    // ✅ Get profile from 'profiles' table
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error("❌ Failed to fetch profile:", fetchError.message);
      alert("Unable to fetch user profile.");
      return;
    }

    console.log("🧠 Profile loaded:", profile);

    const role = profile.role;

    setShowToast(true);
    localStorage.setItem("user", JSON.stringify(user));

    // ✅ Navigate to dashboard based on role
    setTimeout(() => {
      if (role === 'admin') {
        navigate('/DashboardAdmin');
      } else if (role === 'provider') {
        navigate('/SPdashboard');
      } else {
        navigate('/HomepagePetOwner');
      }
    }, 1200);

  } catch (err) {
    console.error("❌ Login error:", err);
    alert(err.message);
  }
};



  return (
    
   <div
  className={styles.loginWrapper}
  style={{
    backgroundImage: "url('/Images/dog-background.png')",
    backgroundSize: "cover",            // Fills the screen
    backgroundPosition: "top center",   // Shift image upward (less zoomed look)
    backgroundRepeat: "no-repeat",
    backgroundColor: "#fae6c3",         // Fallback color
  }}
>


      {/* Loading Screen */}
      {isLoading && <LoadingScreen />}

      <Toast message="Welcome back!" show={showToast} onClose={() => setShowToast(false)} />

      {/* Overlay to improve readability */}
      <div className={styles.overlay}>
        {/* Top Bar */}
        <div className={styles.navbar}>
          <Link to="/">
            <img className={styles.logo} src="/Images/gps.png" alt="Logo" />
          </Link>
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
            <img src="/Images/email.png" alt="email" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label>Password</label>
          <div className={styles.inputGroup}>
            <img src="/Images/pass.png" alt="password" />
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
            <span>Don't have an account yet?</span>
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
