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
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: userRole,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    services_offered: '',
    certificate: null,
    valid_id: null,
    proof_of_address: null,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setToastMsg('Please upload a PDF or image file (JPG, PNG, GIF, WEBP)');
      setShowToast(true);
      e.target.value = ''; // Clear the input
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setToastMsg('File size must be less than 10MB');
      setShowToast(true);
      e.target.value = ''; // Clear the input
      return;
    }

    setFormData({
      ...formData,
      [e.target.name]: file
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
    // Sign up with Supabase Auth and store user info in metadata
    // eslint-disable-next-line no-unused-vars
   const { data, error: signUpError } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
}, {
  data: {
    role: formData.role,
    first_name: formData.first_name,
    last_name: formData.last_name,
    phone: formData.phone,
    address: formData.address,
    services_offered: formData.role === 'provider' ? formData.services_offered : null,
  }
});

    if (signUpError) {
      console.error("❌ Sign-up error:", signUpError.message);
      setToastMsg("Failed to register: " + signUpError.message);
      setShowToast(true);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
  console.error("⚠️ No user ID returned after signup.");
  return;
}

    // Upload provider documents if registering as provider
    let certificateUrl = null;
    let validIdUrl = null;
    let proofOfAddressUrl = null;

    if (formData.role === 'provider') {
      console.log("📤 Uploading provider documents...");
      
      // Upload certificate
      if (formData.certificate) {
        const certificatePath = `provider-documents/${userId}/certificate-${Date.now()}-${formData.certificate.name}`;
        const { error: certError } = await supabase.storage
          .from('provider-documents')
          .upload(certificatePath, formData.certificate);
        
        if (certError) {
          console.error("❌ Certificate upload failed:", certError);
          setToastMsg("Failed to upload certificate");
          setShowToast(true);
          return;
        }
        
        const { data: certUrlData } = supabase.storage
          .from('provider-documents')
          .getPublicUrl(certificatePath);
        certificateUrl = certUrlData.publicUrl;
        console.log("✅ Certificate uploaded:", certificateUrl);
      }

      // Upload valid ID
      if (formData.valid_id) {
        const validIdPath = `provider-documents/${userId}/valid-id-${Date.now()}-${formData.valid_id.name}`;
        const { error: idError } = await supabase.storage
          .from('provider-documents')
          .upload(validIdPath, formData.valid_id);
        
        if (idError) {
          console.error("❌ Valid ID upload failed:", idError);
          setToastMsg("Failed to upload valid ID");
          setShowToast(true);
          return;
        }
        
        const { data: idUrlData } = supabase.storage
          .from('provider-documents')
          .getPublicUrl(validIdPath);
        validIdUrl = idUrlData.publicUrl;
        console.log("✅ Valid ID uploaded:", validIdUrl);
      }

      // Upload proof of address
      if (formData.proof_of_address) {
        const proofPath = `provider-documents/${userId}/proof-of-address-${Date.now()}-${formData.proof_of_address.name}`;
        const { error: proofError } = await supabase.storage
          .from('provider-documents')
          .upload(proofPath, formData.proof_of_address);
        
        if (proofError) {
          console.error("❌ Proof of address upload failed:", proofError);
          setToastMsg("Failed to upload proof of address");
          setShowToast(true);
          return;
        }
        
        const { data: proofUrlData } = supabase.storage
          .from('provider-documents')
          .getPublicUrl(proofPath);
        proofOfAddressUrl = proofUrlData.publicUrl;
        console.log("✅ Proof of address uploaded:", proofOfAddressUrl);
      }
}

if (userId) {
  const profileData = {
    user_id: userId,
    role: formData.role,
    first_name: formData.first_name,
    last_name: formData.last_name,
    phone: formData.phone,
    address: formData.address,
    services_offered: formData.role === 'provider' ? formData.services_offered : null,
    certificate: certificateUrl,
    valid_id: validIdUrl,
    proof_of_address: proofOfAddressUrl,
    status: formData.role === 'provider' ? 'Pending' : 'Approved', // <-- Always "Pending" for providers
  };

  const { error: insertError } = await supabase.from('profiles').insert([profileData]);
  if (insertError) {
    console.error("❌ Failed to insert profile data:", insertError.message);
  } else {
    console.log("✅ Profile inserted successfully!");
  }
}

    console.log("✅ User registered. Awaiting email confirmation.");
   setToastMsg(`✅ Account created as ${formData.role}. Please confirm your email.`);
    setShowToast(true);
    setTimeout(() => {
  navigate('/LoginUser');
}, 2000);
  } catch (err) {
    console.error("❌ Registration error:", err);
    setToastMsg("Something went wrong.");
    setShowToast(true);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className={styles.registerWrapper}>
      <button
        className={styles.homeBtn}
        onClick={() => navigate('/')}
        aria-label="Go to home"
      >
        <img src="/Images/gps.png" alt="Home" className={styles.homeBtnIcon} />
      </button>

      

      <header className={styles.header}>
        <img src="/images/gps.png" alt="logo" className={styles.logoImg} />
        <h1 className={styles.brandTitle}>FurMaps</h1>
        <div className={styles.subtitle}>Join our community of pet lovers</div>
      </header>

      <section className={styles.registerContainer}>
        <div className={styles.registerSection}>
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
                placeholder="example@email.com"
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
                className={formErrors.address ? styles.inputError : ''}
              />
              {formErrors.address && <span className={styles.errorMsg}>{formErrors.address}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordInputGroup}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={formErrors.password ? styles.inputError : ''}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <img 
                    src={showPassword ? "/Icons/close-eye.svg" : "/Icons/open-eye.svg"} 
                    alt={showPassword ? "Hide" : "Show"}
                  />
                </button>
              </div>
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
                    placeholder="Describe the services you offer"
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
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                  {formData.certificate && (
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>📄 {formData.certificate.name}</span>
                      <span className={styles.fileSize}>({(formData.certificate.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
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
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                  {formData.valid_id && (
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>📄 {formData.valid_id.name}</span>
                      <span className={styles.fileSize}>({(formData.valid_id.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
                  {formErrors.valid_id && <span className={styles.errorMsg}>{formErrors.valid_id}</span>}
                </div>
                <div className={styles.requirementsSection}>
                  <label>Proof of Address</label>
                  <div className={styles.uploadBox}>
                    <span className={styles.uploadIcon}>⬆️</span>
                    <span>Upload proof of address</span>
                  </div>
                  <input
                    type="file"
                    name="proof_of_address"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                  />
                  {formData.proof_of_address && (
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>📄 {formData.proof_of_address.name}</span>
                      <span className={styles.fileSize}>({(formData.proof_of_address.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
                  {formErrors.proof_of_address && <span className={styles.errorMsg}>{formErrors.proof_of_address}</span>}
                </div>
                <div className={styles.requirementsNote}>
                  <b>Note:</b> Your account will be pending until all documents are verified.
                </div>
              </div>
            )}

            <button
              type="submit"
              className={styles.createAccountBtn}
              disabled={submitting}
            >
              {submitting ? (
                <span className={styles.spinner}></span>
              ) : (
                formData.role === 'provider' ? 'Submit for Approval' : 'Create Account'
              )}
            </button>

            <div className={styles.loginRedirect}>
              Already have an account? <Link to="/LoginUser">Sign in</Link>
            </div>
          </form>
        </div>
      </section>

      <Toast message={toastMsg} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
};

export default RegisterUser;