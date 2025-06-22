import React, { useEffect, useRef, useState } from 'react';
import './Home.css';
import Welcome from './Welcome'; // Make sure this points to your Welcome.js file

const Home = () => {
  const faqRef = useRef();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    if (faqRef.current) {
      observer.observe(faqRef.current);
    }
  }, []);

  const handleGetStarted = () => {
    setShowModal(true);
  };

  return (
    <>
      {/* Landing Page Section */}
      <div className="homepage">
        {/* Background Shapes */}
        <div className="rectangle6"></div>
        <div className="rectangle7"></div>
        <div className="rectangle8"></div>
        <div className="rectangle3"></div>
        <div className="rectangle9"></div>
        <div className="rectangle10"></div>
        <div className="rectangle11"></div>
        <div className="rectangle12"></div>
        <div className="rectangle14"></div>
        <div className="rectangle31"></div>

        {/* Cat & Dog Image */}
        <img className="cat-dog" src="/images/cat-dog.png" alt="Cat and Dog" />

        {/* Header */}
        <header className="header">
          <div className="logo-group">
            <img className="gps" src="/images/gps.png" alt="GPS Logo" />
            <span className="logo-text">FurMaps</span>
          </div>
          <div className="top-right-icons">
            <img className="image1" src="/images/language.png" alt="Language Icon" />
            <img className="arrow" src="/images/arrow.png" alt="Arrow Icon" />
          </div>
        </header>

        {/* Buttons */}
        <div className="button-wrapper">
          <button className="btn" onClick={handleGetStarted}>Get Started</button>
          <a href="#about" className="btn about-btn">About Us</a>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="faq-section" ref={faqRef} id="about">
        <h2>Frequently Asked Questions</h2>

        <div className="faq-item">
          <h3>&gt; Why do pet owners book through FurMaps instead of pet hotels or freelance sitters?</h3>
          <p>FurMaps offers a cage-free, home-based environment provided by trusted pet lovers in your area...</p>
        </div>

        <div className="faq-item">
          <h3>&gt; What is FurMaps?</h3>
          <p>FurMap is a web-based platform that connects pet owners with reliable pet service providers...</p>
        </div>

        <div className="faq-item">
          <h3>&gt; What is the Dog Walk Monitoring feature?</h3>
          <p>Our Dog Walk Monitoring feature allows you to track your dog’s walk in real time through a map view...</p>
        </div>

        <div className="faq-item">
          <h3>&gt; Why is paying through FurMap safer than paying directly?</h3>
          <p>Paying through FurMap protects your booking. Your payment is held securely and only released to the service provider once the job is completed...</p>
        </div>

        <div className="faq-item">
          <h3>&gt; Can I become a pet sitter, groomer, or pet transport driver with FurMap?</h3>
          <p>Yes! FurMap welcomes passionate and responsible pet lovers to join our growing network...</p>
        </div>
      </section>

      {/* Welcome Popup Modal */}
      {showModal && <Welcome closeModal={() => setShowModal(false)} />}
    </>
  );
};

export default Home;
