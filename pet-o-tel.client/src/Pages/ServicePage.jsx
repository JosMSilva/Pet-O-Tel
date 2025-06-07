import React, { useState, useEffect } from 'react';
import './ServicePage.css';
import { useLocation, useNavigate } from 'react-router-dom';

const ServicePage = () => {

    const { search } = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(search);

    const slug = params.get('service') || '';
    const amenities = [
        'Kitchen', 'WiFi', 'Hot Water', 'TV', 'Heater', 'Dryer',
        'Air Conditioning', 'Smoke Alarm'
    ];

    const [service, setService] = useState(null);

    const [showBookingModal, setShowBookingModal] = useState(false);

    const handleBookNow = () => setShowBookingModal(true);
    const handleCloseModal = () => setShowBookingModal(false);
    const handleConfirmBooking = () => {
        setShowBookingModal(false);
        alert('Booking confirmed! You will be charged $145. Await provider response within 24 hours.');
        navigate('/');
    };


    useEffect(() => {
        async function fetchService() {
            try {
                const response = await fetch(`/Service/${slug}`);
                if (!response.ok) {
                    throw new Error(`Service not found (status ${response.status})`);
                }
                const data = await response.json();
                setService(data);
            } catch (error) {
                console.error('Error fetching service:', error.message);
            }
        }

        fetchService();
    }, [slug]);

    if (!service) return <div>Loading...</div>;

    return (
        <div className="service-page">
            <header className="header">
                <a onClick={() => navigate('/')} className="logo">Pet-O-Tel<span>.com</span></a>
                <div className="userBtnContainer">
                    <button className="userBtn" >Sign In</button>
                </div>
            </header>

            <div className="service-header">
                <div className="service-title">{service.name}</div>
                <div className="service-icons">
                    <button><i className="fa fa-heart-o"/></button>
                    <button><i className="fa fa-share" /></button>
                </div>
            </div>

            <p className="service-address"> Plot 22, Block C, Sea Beach Area, Cox’s Bazar</p>

            <div className="service-gallery">
                <div className="service-gallery-layout">
                    <div className="small-gallery-grid">
                        <img src="/Images/Hotel1.jpg" alt="Small 1" />
                        <img src="/Images/Hotel2.jpg" alt="Small 2" />
                        <img src="/Images/Hotel3.jpg" alt="Small 3" />
                        <div className="service-show-all">Show all photos</div>
                    </div>
                    <div className="large-gallery-image">
                        <img src={`/Images/${service.icon }`} alt="Large" />
                    </div>
                </div>
            </div>

            <div className="info-container">
                <div className="info-left">
                    <div className="service-description-box">
                        <p className="service-description">
                            {service.description}
                        </p>
                    </div>

                    <div className="sDivider" />

                    <div className="amenities-section">
                        <h2 className="amenities-title">Offered Amenities</h2>
                        <div className="amenities-grid">
                            {amenities.map((item, index) => (
                                <div key={index} className="amenity-item">{item}</div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="contact-section">
                    <h2 className="contact-title">Contact {service.name}</h2>
                    <div className="contact-info">📞 1234 932 634</div>
                    <div className="contact-info">📧 contact@gracecox.com</div>
                    <div className="contact-info">🌐 www.gracecox.com</div>

                    <div className="social-icons">
                        <button onClick={handleBookNow}>Book Now</button>

                        
                    </div>
                </div>
            </div>

            {showBookingModal && (
                <div className="booking-modal-overlay">
                    <div className="booking-modal">
                        <h3>Confirm Booking?</h3>
                        <p>
                            After confirming, a payment of <strong>$145</strong> will be made.
                            The provider has a maximum of <strong>24h</strong> to accept or deny your request.
                        </p>
                        <div className="modal-buttons">
                            <button className="confirm-btn" onClick={handleConfirmBooking}>Confirm</button>
                            <button className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default ServicePage;
