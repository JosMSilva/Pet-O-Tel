import { useEffect, useState } from 'react';
import './MainPage.css';
import PetServiceSelector from '../Components/ServiceSelector';
import LoginModal from '../Components/LoginModal';
import SideNav from '../Components/SideNav';
import RegisterModal from '../Components/RegisterModal';
import { useNavigate } from 'react-router-dom';


function MainPage() {

    {/*************************************** Const Declaration ***************************************/}
    const [selected, setSelected] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isSideNavOpen, setIsSideNavOpen] = useState(false);
    const [services, setServices] = useState([]);
    const [location, setLocation] = useState('');
    const getToday = () => { const today = new Date(); return today.toISOString().split('T')[0]; };
    const [startDate, setStartDate] = useState(getToday());
    const [endDate, setEndDate] = useState(getToday());
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [locationError, setLocationError] = useState('');
    

        const setUserRoleToProvider = async () => {
            try {
                const response = await fetch('/users/set-provider-role', {
                    method: 'POST',
                    credentials: 'include', // Needed if using cookies for auth
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message); // Success feedback
                } else {
                    alert(`Error: ${data.message}`); // Error feedback from server
                }
            } catch (error) {
                console.error('Request failed:', error);
                alert('An unexpected error occurred.');
            }
        };

    {/*************************************** Checks For Login Detais ***************************************/ }
    useEffect(() => {
        fetch('/users/profile', {
            credentials: 'include',
        })
            .then(res => {if (res.ok) return res.json();}).then(data => setUser(data)).catch(() => setUser(null));
    }, []);

    {/*************************************** Get Available Service Types ***************************************/ }
    useEffect(() => {
        async function fetchServices() {
            try {
                const response = await fetch('Service/types');
                if (!response.ok) throw new Error('Failed to fetch service types');
                const data = await response.json();
                setServices(data);
            } catch (error) {
                console.error("Error fetching service types:", error);
            }
        }
        fetchServices();
    }, []);

    {/*************************************** Filter Selection ***************************************/ }
    const handleSetSelected = (newSelected) => {
        setSelected(newSelected);

        if (newSelected.length === 0) {
            setActiveIndex(0);
            return;
        }

        const lastId = newSelected[newSelected.length - 1];
        const index = newSelected.findIndex(id => id === lastId);
        setActiveIndex(index);
    };

    {/*************************************** Logout from App ***************************************/ }
    const handleLogout = () => {
        fetch('/users/logout', {
            method: 'POST',
            credentials: 'include',
        }).then(() => {
            setUser(null);
            setIsSideNavOpen(false);
        });
    };

    {/*************************************** Handles Search ***************************************/ }
    const navigate = useNavigate();

    const handleSearch = () => {

        if (!location || location.trim() === '') {
            setLocationError('Please select a location');
            return;
        }

        setLocationError('');

        var newLocation = location;
        if (newLocation === 'All') newLocation = '';

        const params = new URLSearchParams();

        if (location) params.append('location', newLocation.trim());
        if (startDate) params.append('start', startDate);
        if (endDate) params.append('end', endDate);
        if (selected.length) params.append('services', selected.join(','));

        navigate(`/search?${params.toString()}`);
    };


    {/*************************************** Location Select ***************************************/ }

    const districts = [
        "All", 
        "Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra", "Évora",
        "Faro", "Guarda", "Leiria", "Lisboa", "Portalegre", "Porto",
        "Santarém", "Setúbal", "Viana do Castelo", "Vila Real", "Viseu",
        "Açores", "Madeira"
    ];


    const filteredDistricts = districts.filter(d =>
        d.toLowerCase().includes(searchTerm.toLowerCase())
    );

    {/*************************************** Error Message Clear ***************************************/ }

    useEffect(() => {
        if (locationError) {
            const timer = setTimeout(() => setLocationError(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [locationError]);



    return (
        <div className="app">

            {/*************************************** Main Section ***************************************/}
            <div className='mainSection' id='home'>
                <header className="header">
                    {/*************************************** Logo And Nav ***************************************/}
                    <a href="#home" className="logo">Pet-O-Tel<span>.com</span></a>
                    <nav>
                        <a href="#our-services">Our Services</a>
                        <a href="#become-provider">Become a Provider</a>
                        <a href="#contacts">Support</a>
                        <a href="#about">About</a>
                    </nav>
                    <div className="userBtnContainer">
                        <div className="userBtnContainer">
                            {user ? (
                                <button className="userBtn" onClick={() => navigate('/account')}>My Account</button>
                            ) : (
                                <button className="userBtn" onClick={() => setIsModalOpen(true)}>Sign In</button>
                            )}
                        </div>
                    </div>
                </header>

                {/*************************************** Main Component ***************************************/}
                <section className="mainContainer">
                    <div className="reservationMain">
                        <div className='reservationOptions'>
                            <h1 onClick={() => setUserRoleToProvider() }>Sitters, Stays & More — All in One.</h1>
                            <div className="searchBar">
                                <div className="searchable-select">
                                    <input
                                        type="text"
                                        className="searchable-input"
                                        placeholder="Everywhere, Anywhere"
                                        value={location}
                                        onFocus={() => setShowDropdown(true)}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setLocation(e.target.value);
                                        }}
                                        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
                                    />
                                    {showDropdown && (
                                        <ul className="searchable-dropdown">
                                            {filteredDistricts.map((d, idx) => (
                                                <li
                                                    key={idx}
                                                    className={`dropdown-item ${d === location ? 'selected' : ''}`}
                                                    onMouseDown={() => {
                                                        setLocation(d);
                                                        setSearchTerm(d);
                                                        setShowDropdown(false);
                                                    }}
                                                >
                                                    {d}
                                                </li>
                                            ))}

                                        </ul>
                                    )}
                                </div>

                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        const newDate = e.target.value;
                                        setStartDate(newDate);
                                        if(endDate < newDate) setEndDate(newDate);
                                    }}
                                />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />

                                <button onClick={handleSearch}>Search</button>

                            </div>
                            {locationError && <p className="searchError">{locationError}</p>}

                            <PetServiceSelector services={services} selected={selected} setSelected={handleSetSelected} />
                        </div>

                        {/*************************************** Information Box ***************************************/}
                        {selected.length > 0 ? (
                            <div className="infoTextBox">
                                <h3>{services.find(s => s.id === selected[activeIndex])?.label}</h3>
                                <p>{services.find(s => s.id === selected[activeIndex])?.description}</p>

                                {selected.length > 1 && (
                                    <div className="cycle-buttons">
                                        <button onClick={() => setActiveIndex((activeIndex - 1 + selected.length) % selected.length)}>
                                            <i className="fa fa-chevron-left"></i>
                                        </button>
                                        <button onClick={() => setActiveIndex((activeIndex + 1) % selected.length)}>
                                            <i className="fa fa-chevron-right"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="infoTextBox">
                                <h3>Trusted Pet Care, Always</h3>
                                <p>We offer safe, loving, and top-rated services tailored for every kind of pet personality.<br />Choose one or more service categorys to learn about it's details'.</p>
                            </div>
                        )}
                    </div>
                </section>

            {/*************************************** Modals For Login and Register ***************************************/}

            {isModalOpen && (
                <LoginModal
                    onClose={() => setIsModalOpen(false)}
                    onOpenRegister={() => {
                        setIsModalOpen(false);
                        setIsRegisterModalOpen(true);
                    }}
                />
            )}

            {isRegisterModalOpen && (
                <RegisterModal
                    onClose={() => {
                        setIsRegisterModalOpen(false);
                        setIsModalOpen(true);
                    }}
                />
            )}
            {isSideNavOpen && (
                <SideNav
                    onClose={() => setIsSideNavOpen(false)}
                    onLogout={handleLogout}
                />
                )}
            </div>

            {/*************************************** Information Sections ***************************************/}

            {/* Our Services */}
            <section id="our-services" className="section">
                <h2>Our Services</h2>
                <div className="serviceGrid">
                    <div className="serviceCard">
                        <h3>Pet Hotel</h3>
                        <p>Safe and cozy places for pets to stay overnight or longer. Our certified hosts provide care, comfort, and companionship when you're away.</p>
                        <ul>
                            <li>Overnight stays in trusted homes</li>
                            <li>Daily updates and photos</li>
                            <li>Feeding, walks, and playtime included</li>
                        </ul>
                    </div>

                    <div className="serviceCard">
                        <h3>Pet Walking</h3>
                        <p>Professional pet walkers ensure your dog stays active, healthy, and happy while you focus on your day.</p>
                        <ul>
                            <li>Flexible scheduling</li>
                            <li>GPS-tracked walks</li>
                            <li>Individual or group options</li>
                        </ul>
                    </div>

                    <div className="serviceCard">
                        <h3>Pet Sitting</h3>
                        <p>Experienced sitters take care of your pets in the comfort of your home, offering personalized attention and care routines.</p>
                        <ul>
                            <li>Home-based care</li>
                            <li>Ideal for anxious pets</li>
                            <li>Custom feeding & medication routines</li>
                        </ul>
                    </div>

                    <div className="serviceCard">
                        <h3>Pet Daycare</h3>
                        <p>Daytime care with play, feeding, and cuddles — perfect for busy pet parents who want their pets engaged while they're away.</p>
                        <ul>
                            <li>Socialization with other pets</li>
                            <li>Supervised play areas</li>
                            <li>Drop-off and pick-up options</li>
                        </ul>
                    </div>

                    <div className="serviceCard">
                        <h3>Pet Health</h3>
                        <p>Basic wellness services that keep your pets looking and feeling great, all through trusted professionals in your area.</p>
                        <ul>
                            <li>Grooming and bathing</li>
                            <li>Medication administration</li>
                            <li>Vet check coordination</li>
                        </ul>
                    </div>
                </div>
            </section>


            {/* Become a Provider */}
            <section id="become-provider" className="section solutions">
                <h2>Become a Provider</h2>
                <p>
                    Do you love animals and want to make a difference in their lives? Pet-O-Tel makes it easy to turn your passion into a flexible and fulfilling role. Whether you're experienced or just getting started, there's a place for you on our platform.
                </p>

                <h3>Why Join Us?</h3>
                <p>
                    As a provider, you control your availability, services, and pricing. You can offer anything from dog walking and pet sitting to full-time pet hotel stays or health check visits. Choose one or combine a few to fit your lifestyle.
                </p>

                <h3>How It Works</h3>
                <p>
                    Once you aproved, you’ll set up a profile where pet owners can see your experience, availability, and areas of service. When a booking is made, we handle payments securely and provide support along the way.
                </p>

                <h3>What You Get</h3>
                <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                    <li><strong>Flexible schedule:</strong> Work as little or as much as you want.</li>
                    <li><strong>Trusted platform:</strong> Built-in communication tools, verified bookings, and user reviews.</li>
                    <li><strong>Community:</strong> Connect with other providers and get access to useful tips and updates.</li>
                    <li><strong>Support:</strong> We’re here to help if you ever run into questions or issues.</li>
                </ul>

                <p>
                    Ready to get started? <a href="#contacts">Contact us</a> and start sharing your love for pets today.
                </p>
            </section>


            {/* Support */}
            <section id="contacts" className="section">
                <h2>Support</h2>
                <p>Need help? Our support team is always here to assist you with anything related to your bookings, account, or becoming a provider.</p>

                <div className="serviceGrid">
                    <div className="serviceCard">
                        <h3>Customer Service</h3>
                        <p>Get help with bookings, account access, or general questions.</p>
                        <p><strong>Email:</strong> <a href="mailto:support@petotel.com">support@petotel.com</a></p>
                        <p><strong>Phone:</strong> <a href="tel:+351123456789">+351 123 456 789</a></p>
                    </div>

                    <div className="serviceCard">
                        <h3>Partnership Inquiries</h3>
                        <p>Interested in joining Pet-O-Tel as a service provider or partner?</p>
                        <p><strong>Email:</strong> <a href="mailto:partners@petotel.com">partners@petotel.com</a></p>
                    </div>

                    <div className="serviceCard">
                        <h3>Follow Us</h3>
                        <p>Stay connected and updated with the latest news, offers, and pet tips.</p>
                        <p>
                            <a href="" target="_blank" rel="noreferrer">Instagram</a> |
                            <a href="" target="_blank" rel="noreferrer"> Facebook</a> |
                            <a href="" target="_blank" rel="noreferrer"> TikTok</a>
                        </p>
                    </div>
                </div>
            </section>
           

            {/* About Section */}
            <section id="about" className="section">
                <h2>About the Project</h2>
                <p>
                    This web application was developed as part of the curricular unit <strong>Análise de Sistemas</strong>,
                    taught by Professor <strong>Ilídio Oliveira</strong> at the <strong>Universidade de Aveiro</strong>.
                    It forms part of the <strong>Licenciatura em Engenharia de Computadores e Informática</strong> program,
                    within the <strong>DETI</strong> (Departamento de Eletrónica, Telecomunicações e Informática).
                </p>

                <h3>The Developers</h3>
                <div className="developerGrid">
                    {[
                        { name: "Alexandre Silva", img: "Tonny.jpg" },
                        { name: "Daniel Oliveira", img: "Donny.jpg" },
                        { name: "Juan Carpinteiro", img: "Jonny.jpg" },
                        { name: "José Silva", img: "Zonny.jpg" },
                    ].map((dev) => (
                        <div className="developerCard" key={dev.name}>
                            <img src={`${import.meta.env.BASE_URL}/Images/${dev.img}`} alt={dev.name} className="devPhoto" />
                            <h3>{dev.name}</h3>
                        </div>
                    ))}
                </div>
            </section>


        </div>
    );
}

export default MainPage;