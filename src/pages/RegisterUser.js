// RegisterUser.js
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import styles from './RegisterUser.module.css';
import LoadingScreen from '../components/LoadingScreen';
import Toast from '../components/Toast';

const RegisterUser = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userRole = queryParams.get("role") || "owner";
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: userRole,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirm_password: '',
    // Service Provider fields
    services_offered: '',
    certificate: null,
    valid_id: null,
    proof_of_address: null,
  });

  useEffect(() => {
    // Show loading screen for 1.5 seconds when component mounts
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0]
    });
  };

  const validate = () => {
    const errors = {};
    if (!formData.role) errors.role = 'Role is required';
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) errors.email = 'Invalid email';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirm_password) errors.confirm_password = 'Passwords do not match';
    if (formData.role === 'provider') {
      if (!formData.services_offered.trim()) errors.services_offered = 'Describe your services';
      if (!formData.certificate) errors.certificate = 'Certificate required';
      if (!formData.valid_id) errors.valid_id = 'Valid ID required';
      if (!formData.proof_of_address) errors.proof_of_address = 'Proof of address required';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (error) {
        setToastMsg(error.message);
        setShowToast(true);
        setSubmitting(false);
        return;
      }
      if (!data.session) {
        setToastMsg('Please verify your email before continuing.');
        setShowToast(true);
        setSubmitting(false);
        return;
      }
      const userId = data.user.id;
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          id: userId,
          role: formData.role,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          address: formData.address,
        },
      ]);
      if (insertError) {
        setToastMsg('Failed to save user profile: ' + insertError.message);
        setShowToast(true);
      } else {
        setToastMsg('Registered successfully!');
        setShowToast(true);
        setFormData({
          role: userRole,
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          address: '',
          password: '',
          confirm_password: '',
          // Service Provider fields
          services_offered: '',
          certificate: null,
          valid_id: null,
          proof_of_address: null,
        });
      }
    } catch (err) {
      setToastMsg('Registration failed. Please try again.');
      setShowToast(true);
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.registerWrapper} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Home Button - now outside the card */}
      <button
        className={styles.homeBtn}
        type="button"
        onClick={() => navigate('/')}
        aria-label="Go to home"
      >
        <img src="/images/paw-logo.png" alt="Home" className={styles.homeBtnIcon} />
      </button>
      {/* Top left paw print */}
      <img
        src="/images/paw-logo.png"
        alt=""
        style={{
          position: 'absolute',
          top: -60,
          left: -60,
          width: 220,
          height: 220,
          opacity: 0.08,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      {/* Bottom right dog-cat */}
      <img
        src="/images/dog-cat.png"
        alt=""
        style={{
          position: 'absolute',
          bottom: -80,
          right: -80,
          width: 260,
          height: 260,
          opacity: 0.06,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      {/* Loading Screen */}
      {isLoading && <LoadingScreen />}
      
      {/* Top Header */}
      <header className={styles.header}>
        <img src="/images/paw-logo.png" alt="logo" className={styles.logoImg} />
        <h1 className={styles.brandTitle}>FurMaps</h1>
        <div className={styles.subtitle}>Join our community of pet lovers</div>
      </header>

      {/* Form Section */}
      <section className={styles.registerContainer}>
        <div className={styles.registerSection} style={{ position: 'relative' }}>
          {/* Watermark */}
          <img
            src="/images/paw-logo.png"
            alt=""
            style={{
              position: 'absolute',
              bottom: 18,
              right: 18,
              width: 80,
              height: 80,
              opacity: 0.07,
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
          <div className={styles.registerIntro}>
            <h2>Welcome to FurMaps</h2>
            <p>Register your account</p>
          </div>

         <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
            <div className={styles.formGroup}>
              <label htmlFor="role">I am a</label>
              <select
                name="role"
                id="role"
                value={formData.role}
                onChange={handleChange}
                className={formErrors.role ? styles.inputError : ''}
              >
                <option value="owner">Pet Owner</option>
                <option value="provider">Service Provider</option>
              </select>
              {formErrors.role && <span className={styles.errorMsg}>{formErrors.role}</span>}
            </div>
            <div className={styles.rowGroup}>
              <div className={styles.formGroup}>
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  id="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First Name"
                  required
                  className={formErrors.first_name ? styles.inputError : ''}
                />
                {formErrors.first_name && <span className={styles.errorMsg}>{formErrors.first_name}</span>}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  id="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last Name"
                  required
                  className={formErrors.last_name ? styles.inputError : ''}
                />
                {formErrors.last_name && <span className={styles.errorMsg}>{formErrors.last_name}</span>}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ness@example.com"
                required
                className={formErrors.email ? styles.inputError : ''}
              />
              {formErrors.email && <span className={styles.errorMsg}>{formErrors.email}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="XXXX-XXX-XXXX"
                required
                className={formErrors.phone ? styles.inputError : ''}
              />
              {formErrors.phone && <span className={styles.errorMsg}>{formErrors.phone}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="address">Address</label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your full address"
                required
                className={formErrors.address ? styles.inputError : ''}
              />
              {formErrors.address && <span className={styles.errorMsg}>{formErrors.address}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                className={formErrors.password ? styles.inputError : ''}
              />
              {formErrors.password && <span className={styles.errorMsg}>{formErrors.password}</span>}
            </div>
            {formData.role === 'provider' && (
              <div className={styles.requirementsBox}>
                <b className={styles.requirementsTitle}>Service Provider Requirements</b>
                <div className={styles.requirementsSubtitle}>
                  Please upload the following documents for verification.
                </div>
                <div className={styles.requirementsSection}>
                  <label htmlFor="services_offered">Services Offered</label>
                  <input
                    type="text"
                    name="services_offered"
                    id="services_offered"
                    value={formData.services_offered}
                    onChange={handleChange}
                    placeholder="Describe the services you offer (e.g., dog walking, pet grooming, pet sitting)"
                    className={formErrors.services_offered ? styles.inputError : ''}
                  />
                  {formErrors.services_offered && <span className={styles.errorMsg}>{formErrors.services_offered}</span>}
                </div>
                <div className={styles.requirementsSection}>
                  <label>Professional Certificates</label>
                  <div className={styles.uploadBox}>
                    <span className={styles.uploadIcon}>⬆️</span>
                    <span>Upload your professional certificates.</span>
                  </div>
                  <input
                    type="file"
                    name="certificate"
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                  {formData.certificate && <span className={styles.fileName}>{formData.certificate.name}</span>}
                  {formErrors.certificate && <span className={styles.errorMsg}>{formErrors.certificate}</span>}
                </div>
                <div className={styles.requirementsSection}>
                  <label>Valid ID</label>
                  <div className={styles.uploadBox}>
                    <span className={styles.uploadIcon}>⬆️</span>
                    <span>Upload a copy of your valid ID.</span>
                  </div>
                  <input
                    type="file"
                    name="valid_id"
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                  {formData.valid_id && <span className={styles.fileName}>{formData.valid_id.name}</span>}
                  {formErrors.valid_id && <span className={styles.errorMsg}>{formErrors.valid_id}</span>}
                </div>
                <div className={styles.requirementsSection}>
                  <label>Proof of Address</label>
                  <div className={styles.uploadBox}>
                    <span className={styles.uploadIcon}>⬆️</span>
                    <span>Upload proof of address (utility bill, lease, etc.)</span>
                  </div>
                  <input
                    type="file"
                    name="proof_of_address"
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                  {formData.proof_of_address && <span className={styles.fileName}>{formData.proof_of_address.name}</span>}
                  {formErrors.proof_of_address && <span className={styles.errorMsg}>{formErrors.proof_of_address}</span>}
                </div>
                <div className={styles.requirementsNote}>
                  <b>Note:</b> Your account will be pending until all documents are verified by our admin team.
                </div>
              </div>
            )}
            <button type="submit" className={styles.createAccountBtn} disabled={submitting}>
              {submitting ? <span className={styles.spinner}></span> : (formData.role === 'provider' ? 'Submit for Approval' : 'Create Account')}
            </button>
            <div className={styles.loginRedirect}>
              Already have an account? <Link to="/LoginUser">Sign in</Link>
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
      <Toast message={toastMsg} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};

export default RegisterUser;
