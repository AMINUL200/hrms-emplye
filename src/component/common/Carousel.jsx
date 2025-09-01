import React, { useRef, useEffect } from 'react';
import { carVideo } from '../../assets';

const Carousel = ({ img1, img2, img3 }) => {
    const videoRef = useRef(null);
    const carouselRef = useRef(null);

    // Initialize Bootstrap Carousel and handle slide events
    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        // Listen for slide changes
        const handleSlide = (e) => {
            const slideIndex = e.to; // Index of the new slide
            const video = videoRef.current;

            if (video) {
                if (slideIndex === 3) { // If the video slide (4th slide) is active
                    video.play().catch(e => console.log("Auto-play failed:", e));
                } else {
                    video.pause();
                    video.currentTime = 0; // Reset video to start
                }
            }
        };

        carousel.addEventListener('slid.bs.carousel', handleSlide);

        // Cleanup
        return () => {
            carousel.removeEventListener('slid.bs.carousel', handleSlide);
        };
    }, []);

    return (
        <div id="loginCarousel" className="carousel slide carousel-dark" ref={carouselRef} data-bs-ride="carousel" data-bs-interval="2000">
            <div className="carousel-indicators">
                <button type="button" data-bs-target="#loginCarousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                <button type="button" data-bs-target="#loginCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
                <button type="button" data-bs-target="#loginCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
                <button type="button" data-bs-target="#loginCarousel" data-bs-slide-to="3" aria-label="Slide 4"></button>
            </div>

            <div className="carousel-inner h-100">
                <div className="carousel-item active">
                    <img src={img1} className="d-block w-100" alt="Slide 1" style={{ objectFit: 'cover', height: '350px' }} />
                    <div className="text-center">
                        <h2><b>Your UKVI Compliance Partner</b></h2>
                        <p>Easily manage right-to-work checks and sponsorship compliance. Our HRMS helps you navigate UKVI regulations, ensuring your business stays compliant and secure.</p>
                    </div>
                </div>
                <div className="carousel-item" data-bs-interval="2000">
                    <img src={img2} className="d-block w-100" alt="Slide 2" style={{ objectFit: 'cover', height: '350px' }} />
                    <div className="text-center">
                        <h2><b>Welcome to Smarter HR Management</b></h2>
                        <p>Streamline recruitment and onboarding with automated workflows and centralized data. Hire faster, onboard seamlessly, and set new hires up for success with ease.</p>
                    </div>
                </div>
                <div className="carousel-item">
                    <img src={img3} className="d-block w-100" alt="Slide 3" style={{ objectFit: 'cover', height: '350px' }} />
                    <div className="text-center">
                        <h2><b>Empowering Data at Your Fingertips</b></h2>
                        <p>Gain valuable insights into your workforce with real-time analytics and custom reports. Make informed HR decisions to boost productivity and engagement.</p>
                    </div>
                </div>
                <div className="carousel-item">
                    <div>
                        <video
                            ref={videoRef}
                            src={carVideo}
                            className="w-100"
                            style={{ objectFit: 'cover', height: '350px', padding: '70px 50px 40px 50px' }}
                            controls
                            muted
                        />
                    </div>

                    <div className="text-center">
                        <h2><b>Efficient HR Starts Here</b></h2>
                        <p>Our platform is designed for seamless HR management—automate recruitment, track employee data, and ensure compliance effortlessly with SWC HRMS.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Carousel;