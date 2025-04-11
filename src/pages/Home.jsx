import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import "./Home.css";
import { FaGraduationCap, FaExchangeAlt, FaShieldAlt, FaMobileAlt, FaAngleDown, FaArrowRight, FaCar } from "react-icons/fa";

function Home() {
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const testimonialsRef = useRef(null);
  const aboutRef = useRef(null);
  
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px"
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);
    
    // Observe all sections
    const sections = document.querySelectorAll('.animate-on-scroll');
    sections.forEach(section => {
      observer.observe(section);
    });
    
    return () => {
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);
  
  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Matie Market</h1>
          <p className="hero-subtitle">The exclusive marketplace for Stellenbosch University students</p>
          
          <div className="hero-cta">
            <Link to="/login" className="cta-button primary">Log In</Link>
            <Link to="/signup" className="cta-button secondary">Sign Up</Link>
          </div>
          
          <button className="scroll-indicator" onClick={() => scrollToSection(aboutRef)}>
            <span>Learn More</span>
            <FaAngleDown className="bounce" />
          </button>
        </div>
      </section>
      
      {/* About Section */}
      <section ref={aboutRef} className="about-section animate-on-scroll">
        <div className="about-content">
          <h2>What is Matie Market?</h2>
          <p>Matie Market is a dedicated online marketplace exclusively for Stellenbosch University students. 
            Buy and sell textbooks, electronics, furniture, and more with fellow students in a safe, 
            convenient platform designed specifically for the Matie community. Now with our new ride sharing feature, 
            you can also find or offer rides to share travel costs and reduce your carbon footprint!</p>
            
          <button 
            className="discover-more-btn"
            onClick={() => scrollToSection(featuresRef)}
          >
            <span>Discover Features</span>
            <FaArrowRight className="arrow-icon" />
          </button>
        </div>
      </section>
      
      {/* Features Section */}
      <section ref={featuresRef} className="features-section animate-on-scroll">
        <h2>Why Use Matie Market?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaGraduationCap />
            </div>
            <h3>Exclusively for Maties</h3>
            <p>Connect only with verified Stellenbosch University students</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaExchangeAlt />
            </div>
            <h3>Buy & Sell Easily</h3>
            <p>Simple listings, easy communication, and seamless transactions</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaShieldAlt />
            </div>
            <h3>Safe & Secure</h3>
            <p>Trade confidently with fellow students in a trusted environment</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaMobileAlt />
            </div>
            <h3>Mobile Friendly</h3>
            <p>Access Matie Market anywhere on campus from any device</p>
          </div>

          <div className="feature-card highlight-card">
            <div className="feature-icon">
              <FaCar />
            </div>
            <h3>Share Rides</h3>
            <p>Find or offer rides with fellow students to save money and reduce carbon emissions</p>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section ref={howItWorksRef} className="how-it-works animate-on-scroll">
        <h2>How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create an Account</h3>
            <p>Sign up with your Stellenbosch University email address</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Browse Listings</h3>
            <p>Find what you need, list items you want to sell, or share/book rides</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Connect</h3>
            <p>Message sellers, arrange meetups, and complete transactions</p>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <h3>Trade Safely</h3>
            <p>Exchange items on campus for maximum convenience and safety</p>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="testimonials-section animate-on-scroll">
        <h2>What Students Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial">
            <p className="quote">"Matie Market helped me find all my textbooks at half the price of the bookstore. Absolute lifesaver for my budget!"</p>
            <p className="student">- Engineering Student, 2nd Year</p>
          </div>
          
          <div className="testimonial">
            <p className="quote">"I sold my old laptop and furniture within days. So much easier than posting on social media groups."</p>
            <p className="student">- Business Science Student, 3rd Year</p>
          </div>
          
          <div className="testimonial">
            <p className="quote">"The ride sharing feature saved me so much on transportation costs when going home for the holidays!"</p>
            <p className="student">- Arts & Social Sciences Student, 1st Year</p>
          </div>
        </div>
      </section>
      
      {/* Final CTA Section */}
      <section className="bottom-cta animate-on-scroll">
        <div className="cta-content">
          <h2>Ready to join the Matie Market community?</h2>
          <p>Start buying, selling, and sharing rides with fellow Stellenbosch students today!</p>
          <div className="cta-buttons">
            <Link to="/signup" className="cta-button primary">Create Account</Link>
            <Link to="/login" className="cta-button secondary">Log In</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;