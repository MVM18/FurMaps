import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import styles from './LoginUser.module.css';
import { Link, useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

const LoginUser = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) return alert("Email and password required.");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error && error.message.includes("Email not confirmed")) {
        return alert("📧 Please confirm your email before logging in.");
      }

      if (error) throw error;

      const user = data.user;
      console.log("✅ Logged in user:", user);

      // Get profile from 'profiles' table
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

      // Navigate based on role
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/AdminDashboard');
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
    <div className={styles.loginWrapper}>
      {/* Loading Screen would render here if isLoading is true */}
      
      <Toast 
        message="Welcome back!" 
        show={showToast} 
        onClose={() => setShowToast(false)} 
      />

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
          <div className={`${styles.inputGroup} ${styles.passwordGroup}`}>
          <img src="/Images/pass.png" alt="password" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className={styles.toggleContainer}>
            <img 
              src={showPassword ? "Icons/close-eye.svg" : "Icons/open-eye.svg"} 
              alt={showPassword ? "Hide password" : "Show password"}
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
        </div>
     
        <button className={styles.loginButton} onClick={handleLogin}>
          Log In
        </button>

        <div className={styles.register}>
          <span>Don't have an account yet?</span>
          <Link to="/RegisterUser">   Register Here</Link>
        </div>
      </div>

    </div>
  );
};

export default LoginUser;