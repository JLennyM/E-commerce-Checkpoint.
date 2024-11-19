import './Navbar.css';
import navlogo from '../../assets/logo.png';

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="logo-container">
        <img src={navlogo} alt="CyberBazaar Logo" className="nav-logo" />
        <span className="logo-text">CyberBazaar</span>
      </div>
    </div>
  );
};

export default Navbar;
