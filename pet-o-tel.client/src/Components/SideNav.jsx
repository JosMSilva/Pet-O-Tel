import React from 'react';
import './SideNav.css';

const SideNav = ({ onClose, onLogout }) => {
    return (
        <div className="sideNavOverlay" onClick={onClose}>
            <div className="sideNav" onClick={e => e.stopPropagation()}>
                
                <ul>
                    <li><button onClick={() => alert('My Bookings clicked')}>My Bookings</button></li>
                    <li><button onClick={() => alert('Personal Details clicked')}>Personal Details</button></li>
                    <li><button onClick={() => alert('Become a Provider clicked')}>Become a Provider</button></li>
                    <li><button onClick={onLogout}>Logout</button></li>
                </ul>
            </div>
        </div>
    );
};

export default SideNav;
