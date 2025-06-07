import './ResultCard.css';
import { useNavigate } from 'react-router-dom';

export default function ResultCard({ id, name, slug, description, icon, location, price, rating, type }) {

    const navigate = useNavigate();

    const handleSelect = () => {

         const params = new URLSearchParams();

        if (slug) params.append('service', slug.trim());

        navigate(`/service?${params.toString()}`);
    };


    return (
        <div className="hotelCard">
            <img src={`/Images/${icon}`} alt={name} className="hotelImage" />
            <div className="hotelDetails">
                <div className="resultCardHeader">
                    <h3 >{name}</h3>
                    <span >{rating.toFixed(1)}</span>
                </div>
                <p className="resultCardLocation">{location}</p>
                <p className="resultCardDescription">{description}</p>
                <div className="resultCardFooter">
                    <span >{price}€</span>
                    <a onClick={handleSelect }>See availability</a>
                </div>
            </div>
        </div>
    );
}
