import React, { useState, useEffect } from 'react';
import './MyAccount.css';
import { useNavigate } from 'react-router-dom';

export default function MyAccount() {
    const [user, setUser] = useState(null);
    const [selectedMenu, setSelectedMenu] = useState('My Animals');
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/users/profile', {
            credentials: 'include',
        })
            .then(res => res.ok && res.json())
            .then(data => setUser(data))
            .catch(() => navigate('/'));
    }, []);

    const handleLogout = () => {
        fetch('/users/logout', {
            method: 'POST',
            credentials: 'include',
        }).then(() => {
            setUser(null);
            navigate('/');
        });
    };

    const renderMainContent = () => {
        switch (selectedMenu) {
            case 'My Profile':
                return <MyProfile user={user} />;
            case 'Delivery Address':
                return <DeliveryAddress />;
            case 'Next Orders':
                return <NextOrders />;
            case 'Ordered Services':
                return <OrderedServices />;
            case 'My Animals':
                return <MyAnimals />;
            case 'Animal History':
                return <AnimalHistory />;
            case 'My Earnings':
                return <MyEarnings />;
            case 'Next Services':
                return <NextServices />;
            case 'Service History':
                return <ServiceHistory />;
            case 'Add Service':
                return <AddService />
            case 'Refer Friend':
                return <ReferFriend />;
            default:
                return <p>Select an option from the sidebar.</p>;
        }
    };

    return (
        <div className="account-container">
            <header className="header">
                <a onClick={() => navigate('/')} className="logo">Pet-O-Tel<span>.com</span></a>
                <div className="userBtnContainer">
                    {user && <button className="userBtn" onClick={handleLogout}>Log Out</button>}
                </div>
            </header>

            <div className="userSidebar">
                <div className="userSideHeader">
                    <div className="userAvatar">
                        {user?.fullName?.trim().split(' ').filter(Boolean).map(word => word[0].toUpperCase()).join('')}
                    </div>
                    <div>
                        <div className="userName">{user?.fullName}</div>
                        <div className="userRole"><i className="fa fa-user"></i>{user?.role}</div>
                    </div>
                </div>

                <div className="userSideMenu">
                    <ul>
                        <li onClick={() => setSelectedMenu('My Profile')}><i className="fa fa-user"></i> My Profile</li>
                        <li onClick={() => setSelectedMenu('Delivery Address')}><i className="fa fa-map"></i> Delivery Address</li>
                    </ul>

                    <div className="userDivider" />

                    <ul>
                        <li onClick={() => setSelectedMenu('Next Orders')}><i className="fa fa-shopping-bag"></i> Next Orders</li>
                        <li onClick={() => setSelectedMenu('Ordered Services')}><i className="fa fa-refresh"></i> Ordered Services</li>
                    </ul>

                    <div className="userDivider" />

                    <ul>
                        <li onClick={() => setSelectedMenu('My Animals')} className={selectedMenu === 'My Animals' ? 'active' : ''}><i className="fa fa-heart"></i> My Animals</li>
                        <li onClick={() => setSelectedMenu('Animal History')}><i className="fa fa-newspaper-o"></i> Animal History</li>
                    </ul>

                    {user?.role === 'Provider' && <>
                        <div className="userDivider" />
                        <ul>
                            <li onClick={() => setSelectedMenu('My Earnings')}><i className="fa fa-money"></i> My Earnings</li>
                            <li onClick={() => setSelectedMenu('Next Services')}><i className="fa fa-tasks"></i> Next Services</li>
                            <li onClick={() => setSelectedMenu('Service History')}><i className="fa fa-history"></i> Service History</li>
                            <li onClick={() => setSelectedMenu('Add Service')}><i className="fa fa-plus"></i> Add Service</li>
                        </ul>
                    </>}

                    <div className="userDivider" />
                    <ul>
                        <li onClick={() => setSelectedMenu('Refer Friend')}><i className="fa fa-user-plus"></i> Refer Friend</li>
                    </ul>
                </div>
            </div>

            <div className="userMainContent">
                <h2>Welcome, {user?.fullName}!</h2>
                {renderMainContent()}
            </div>
        </div>
    );
}

const MyProfile = ({ user }) => {
    return (
        <div className="profileCard">
            <h2>Profile</h2>

            <div className="profileHeader">
                <img
                    src={user.profilePicture || "/Images/defaultUser.png"}
                    alt="User Profile"
                    className="profilePic"
                />
                <div className="profileInfo">
                    <h3>{user.fullName}</h3>
                    <p className="email">{user.email} | {user.username}</p>
                    <p className="role">{user.role || "Technical Writer"}</p>
                </div>
                <div className="moreOptions">⋮</div>
            </div>

            <div className="profileFields">
                <div className="formGroup">
                    <label>Phone number</label>
                    <div className="phoneInput">
                        <span className="flag">🇨🇷</span>
                        <input type="text" defaultValue="+53 042 627 89" />
                    </div>
                </div>

                <div className="formGroup">
                    <label>Default for company tab</label>
                    <select>
                        <option>-- Use Last Selected --</option>
                        <option>Dashboard</option>
                        <option>Projects</option>
                        <option>Billing</option>
                    </select>
                </div>

                <div className="formGroup">
                    <label>Language</label>
                    <select defaultValue="English">
                        <option>English</option>
                        <option>Español</option>
                        <option>Português</option>
                        <option>Deutsch</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

const Card = ({ children }) => (
    <div className="item-card">
        {children}
    </div>
);



const DeliveryAddress = () => (
    <div>
        <h3>Delivery Address</h3>
        <Card><strong>Home:</strong> 1234 Pet Street, Puppyville</Card>
        <Card><strong>Work:</strong> 5678 Groomer Ave, Barktown</Card>
        <button className="card-btn">Add New Address</button>
    </div>
);

const NextOrders = () => (
    <div>
        <h3>Next Orders</h3>
        <Card>🐾 Pet Sitting for Max – Tomorrow at 2 PM</Card>
        <Card>🐾 Vet Appointment for Luna – June 5</Card>
    </div>
);

const OrderedServices = () => (
    <div>
        <h3>Ordered Services</h3>
        <Card>✔️ Dog Grooming – Completed on May 20</Card>
        <Card>✔️ Pet Taxi – Completed on May 15</Card>
    </div>
);

const MyAnimals = () => (
    <div>
        <h3>My Animals</h3>
        <Card>🐶 Max – Labrador, 3 years</Card>
        <Card>🐱 Luna – Persian, 2 years</Card>
        <button className="card-btn">Add New Animal</button>
    </div>
);

const AnimalHistory = () => (
    <div>
        <h3>Animal History</h3>
        <Card>Medical check-ups, vaccination records, and service logs will appear here.</Card>
    </div>
);

const MyEarnings = () => (
    <div>
        <h3>My Earnings</h3>
        <Card>
            <p><strong>Total Earnings:</strong> $440</p>
            <p><strong>Last Payment:</strong> $120 on May 29</p>
            <button className="card-btn">Withdraw</button>
        </Card>
    </div>
);

const NextServices = () => (
    <div>
        <h3>Next Services</h3>
        <Card>🐕 Walk Bella at 10 AM</Card>
        <Card>🐈 Feed Oscar at 3 PM</Card>
    </div>
);

const ServiceHistory = () => (
    <div>
        <h3>Service History</h3>
        <Card>🦴 Walked Bruno – May 25</Card>
        <Card>🏡 Boarded Nala – May 21 to May 23</Card>
    </div>
);

const AddService = () => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        location: '',
        price: '',
        type: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [test, setTest] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTest(true);
        const { name, slug, location, price, type } = formData;
        if (!name || !slug || !location || !price || !type) {
            setError('Please fill all required fields.');
            return;
        }

        try {
            const response = await fetch('Service/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseInt(formData.price),
                    type: parseInt(formData.type)
                })
            });

            if (!response.ok) throw new Error('Failed to add service');

            setSuccess('Service added successfully!');
            setFormData({
                name: '',
                slug: '',
                description: '',
                location: '',
                price: '',
                type: ''
            });
            setShowForm(false);
        } catch (err) {
            setError('Error submitting form.');
        }
    };

    return (
        <div>
            <h3>Available Services</h3>
            {test && <Card>🏠 Pet Sitting – $10/hour, Aveiro</Card>}
            <button className="card-btn" onClick={() => setShowForm(true)}>➕ Add New Service</button>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Create a New Service</h2>
                        {error && <p className="form-error">{error}</p>}
                        {success && <p className="form-success">{success}</p>}

                        <form onSubmit={handleSubmit}>
                            <label>Name*:
                                <input name="name" value={formData.name} onChange={handleChange} required />
                            </label>

                            <label>Slug*:
                                <input name="slug" value={formData.slug} onChange={handleChange} required />
                            </label>

                            <label>Description:
                                <textarea name="description" value={formData.description} onChange={handleChange} />
                            </label>

                            <label>Location*:
                                <input name="location" value={formData.location} onChange={handleChange} required />
                            </label>

                            <label>Price (in $)*:
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                            </label>

                            <label>Type (number)*:
                                <select name="type" value={formData.type} onChange={handleChange} required>
                                    <option value="">Select a type</option>
                                    <option value="1">1 – Pet Hotel</option>
                                    <option value="2">2 – Pet Walking</option>
                                    <option value="3">3 – Pet Sitting</option>
                                    <option value="4">4 – Pet Daycare</option>
                                    <option value="5">5 – Pet Care</option>
                                </select>
                            </label>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" onClick={() => handleSubmit()}>Submit</button>
                                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


const ReferFriend = () => (
    <div>
        <h3>Refer a Friend</h3>
        <p>Invite your friends and earn $10 credit when they book a service!</p>
        <input type="text" placeholder="Friend's email" />
        <button>Send Invite</button>
    </div>
);
