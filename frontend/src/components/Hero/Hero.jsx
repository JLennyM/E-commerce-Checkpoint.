import React from 'react';
import './Hero.css';
import hand_icon from '../Assests/hand_icon.png';
import hero_image from '../Assests/hero_image.jpg';


const Hero = () => {
  return (
    <div className="hero">
      <div className="hero_left">
        <h2>New arrivals only</h2>
        <div>
          <div className="hero-hand-icon">
            <p>new</p>
            <img src={hand_icon} alt="Hand icon" />
          </div>
          <p>Collections</p>
          <p>for everyone</p>
        </div>
        <div className="hero-latest-btn">
          <span>Latest Collections</span>
           </div>
      </div>
      <div className="hero_right">
        <img src={hero_image} alt="Hero section showcasing new arrivals" />
      </div>
    </div>
  );
};

export default Hero;
