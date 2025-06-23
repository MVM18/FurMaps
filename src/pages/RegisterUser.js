import React, { useState } from 'react';
import './RegisterUser.css'; 
import { Link } from 'react-router-dom';


const RegisterUser = () => {

 const [formData, setFormData] = useState({
  fullname: '',
  email: '',
  password: '',
  confirm_password: ''
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
        password: formData.password
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
    <div className="Register">

      {/* Top Navigation */}
      <div className="absolute" style={{ top: 0, left: 0, width: '1440px', height: '67px', background: '#1B2B49' }}></div>
      <div className="absolute heading" style={{ top: '8px', left: '80px', fontSize: '40px' }}>FurMaps</div>
      <div className="absolute" style={{ top: '2px', left: '9px' }}>
        <img src="/images/gps.png" width="63" height="63" alt="logo" />
      </div>

      {/* Register Box */}
      <div className="absolute" style={{ top: '65px', left: '-24px', width: '1482px', height: '597px', background: 'white', borderRadius: '23px' }}></div>
      <div className="absolute" style={{ top: '128px', left: '80px', width: '1263px', height: '282px', background: '#FAE6C3', borderRadius: '23px' }}></div>
      <div className="absolute" style={{ top: '75px', left: '503px', width: '489px', height: '71px' }}>
        <span style={{ color: '#A84710', fontSize: '40px', fontFamily: 'Fredoka One' }}>Welcome to FurMaps</span>
      </div>

      {/* Form Labels */}
      <div className="absolute form-label" style={{ top: '145px', left: '125px', fontSize: '20px', fontWeight: '800' }}>Register</div>
      <div className="absolute form-label" style={{ top: '198px', left: '138px' }}>Full Name</div>
      <div className="absolute form-label" style={{ top: '275px', left: '138px' }}>Email</div>
      <div className="absolute form-label" style={{ top: '199px', left: '551px' }}>Password</div>
      <div className="absolute form-label" style={{ top: '276px', left: '553px' }}>Confirm Password</div>

      {/* Form */}
     <form onSubmit={handleSubmit}>
  <input
    type="text"
    name="fullname"
    value={formData.fullname}
    onChange={handleChange}
    placeholder="Enter full name"
    className="form-input"
    style={{ top: '223px', left: '138px' }}
  />
  <img className="absolute" src="/images/user.png" style={{ top: '225px', left: '144px', width: '30px', height: '30px', opacity: 0.25, zIndex: 3 }} alt="user" />

  <input
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    placeholder="Enter email"
    className="form-input"
    style={{ top: '300px', left: '138px' }}
  />
  <img className="absolute" src="/images/email.png" style={{ top: '302px', left: '144px', width: '30px', height: '30px', opacity: 0.25, zIndex: 3 }} alt="email" />

  <input
    type="password"
    name="password"
    value={formData.password}
    onChange={handleChange}
    placeholder="Enter password"
    className="form-input"
    style={{ top: '222px', left: '551px', height: '38px' }}
  />
  <img className="absolute" src="/images/pass.png" style={{ top: '227px', left: '562px', width: '30px', height: '30px', opacity: 0.25, zIndex: 3 }} alt="password" />

  <input
    type="password"
    name="confirm_password"
    value={formData.confirm_password}
    onChange={handleChange}
    placeholder="Confirm password"
    className="form-input"
    style={{ top: '299px', left: '551px', height: '39px' }}
  />
  <img className="absolute" src="/images/confirm-pass.png" style={{ top: '307px', left: '562px', width: '30px', height: '30px', opacity: 0.25, zIndex: 3 }} alt="confirm" />

  <button className="register-btn" type="submit">Register</button>
</form>

      {/* Info & Footer */}
      <div className="absolute form-label" style={{ top: '419px', left: '939px', fontSize: '16px', fontWeight: '600' }}>Already have a FurMaps account?</div>
           
          <Link
  to="/LoginUser"
  className="absolute heading"
  style={{
    top: '418px',
    left: '1236px',
    fontSize: '20px',
    color: '#4588C7',
    cursor: 'pointer',
    textDecoration: 'none',
    position: 'absolute',
    zIndex: 999, 
    pointerEvents: 'auto' 
  }}
>
  Sign In
</Link>



      <div className="absolute divider" style={{ top: '195px', left: '517px', width: '169px' }}></div>
      <div className="absolute divider" style={{ top: '187px', left: '934px', width: '169px' }}></div>

      <img className="absolute" src="/images/paw-logo.png" style={{ top: '163px', left: '1095px', width: '91px', height: '91px', zIndex: 2 }} alt="paw" />
      <img className="absolute" src="/images/cat-dog-cat.png" style={{ top: '269px', left: '105px', width: '1184px', height: '527px', zIndex: 1 }} alt="pets" />

      {/* Footer Section */}
      <div className="absolute" style={{ top: '662px', left: 0, width: '1440px', height: '457px', background: '#E2F1FF' }}></div>
      <div className="absolute heading" style={{ top: '733px', left: '134px', fontSize: '26px', color: 'black' }}>FurMaps</div>
      <div className="absolute section-link" style={{ top: '791px', left: '134px' }}>About us</div>
      <div className="absolute section-link" style={{ top: '839px', left: '134px' }}>Help Center</div>
      <div className="absolute section-link" style={{ top: '893px', left: '134px' }}>Terms of Use</div>
      <div className="absolute section-link" style={{ top: '944px', left: '134px' }}>Privacy Policy</div>

      <div className="absolute section-title" style={{ top: '784px', left: '401px' }}>Pet Lover</div>
      <div className="absolute section-link" style={{ top: '842px', left: '401px' }}>Be a Pet Sitter</div>
      <div className="absolute section-link" style={{ top: '893px', left: '401px' }}>Be a Dog Walker</div>

      <div className="absolute section-title" style={{ top: '718px', left: '662px' }}>Pet Services</div>
      <div className="absolute section-link" style={{ top: '776px', left: '666px' }}>Pet Boarding</div>
      <div className="absolute section-link" style={{ top: '819px', left: '666px' }}>Pet Sitting</div>
      <div className="absolute section-link" style={{ top: '863px', left: '666px' }}>Pet Daycare</div>
      <div className="absolute section-link" style={{ top: '906px', left: '666px' }}>Dog Walking</div>
      <div className="absolute section-link" style={{ top: '946px', left: '666px' }}>Pet Grooming</div>

      <div className="absolute section-title" style={{ top: '718px', left: '1045px' }}>CONTACT US</div>
      <div className="absolute section-link" style={{ top: '773px', left: '1128px' }}>Email us</div>
      <img className="absolute" src="/images/blck-email.png" style={{ top: '765px', left: '1045px', width: '59px', height: '52px' }} alt="email" />
    </div>
  );
};

export default RegisterUser;
