import { Link } from "react-router-dom";
import "./Home.css";
import { FaGraduationCap, FaExchangeAlt, FaShieldAlt, FaMobileAlt } from "react-icons/fa";

function Home() {
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
        </div>
      </section>
      
      {/* About Section */}
      <section className="about-section">
        <div className="about-content">
          <h2>What is Matie Market?</h2>
          <p>Matie Market is a dedicated online marketplace exclusively for Stellenbosch University students. 
            Buy and sell textbooks, electronics, furniture, and more with fellow students in a safe, 
            convenient platform designed specifically for the Matie community.</p>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="features-section">
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
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="how-it-works">
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
            <p>Find what you need or list items you want to sell</p>
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
      <section className="testimonials-section">
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
            <p className="quote">"As an international student, Matie Market made it so easy to get settled with everything I needed for my apartment."</p>
            <p className="student">- Arts & Social Sciences Student, 1st Year</p>
          </div>
        </div>
      </section>
      
      {/* Final CTA Section */}
      <section className="bottom-cta">
        <div className="cta-content">
          <h2>Ready to join the Matie Market community?</h2>
          <p>Start buying and selling with fellow Stellenbosch students today!</p>
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