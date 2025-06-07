import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ResultCard from '../Components/ResultCard';
import './SearchResult.css';

export default function SearchResults() {
    const { search } = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(search);

    const location = params.get('location') || '';
    const startDate = params.get('start') || '';
    const endDate = params.get('end') || '';
    const servicesQs = params.get('services') || '';
    const selectedServices = servicesQs ? servicesQs.split(',').map(Number) : [];

    const [results, setResults] = useState([]);
    const [availableTypes, setAvailableTypes] = useState([]);
    const [filters, setFilters] = useState(new Set(selectedServices));
    const [types, setTypes] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('Service/list');
                if (!response.ok) throw new Error('Failed to fetch services');
                const data = await response.json();
                setResults(data);
                const uniqueTypes = [...new Set(data.map(hotel => hotel.type))];
                setAvailableTypes(uniqueTypes);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        async function fetchServices() {
            try {
                const response = await fetch('Service/types');
                if (!response.ok) throw new Error('Failed to fetch service types');
                const data = await response.json();
                setTypes(data);
            } catch (error) {
                console.error("Error fetching service types:", error);
            }
        }

        fetchServices();
        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters]);

    const toggleService = (typeId) => {
        const newFilters = new Set(filters);
        if (filters.has(typeId)) {
            newFilters.delete(typeId);
        } else {
            newFilters.add(typeId);
        }
        setFilters(newFilters);
    };

    const applyFilters = () => {
        const query = new URLSearchParams();
        if (location) query.set('location', location);
        if (startDate) query.set('start', startDate);
        if (endDate) query.set('end', endDate);
        if (filters.size > 0) query.set('services', [...filters].join(','));
        navigate(`/search?${query.toString()}`);
    };

    return (
        <div className="resultsPage">
            <a onClick={() => navigate('/')} className="searchLogo">Pet-O-Tel<span>.com</span></a>

            <div className="filterTab">
                <h3>Filter by:</h3>
                <div className="filterDivider"></div>
                <h4>Category</h4>
                <div className="serviceFilters">
                    {types.map(type => (
                        <button key={type.id} onClick={() => toggleService(type.id)} className={`filterChip ${filters.has(type.id) ? 'active' : ''}`}>
                            <img src={`/Images/${type.icon}`} alt={type.label} />
                            {type.label}
                            
                        </button>
                    ))}
                </div>
                <div className="filterDivider"></div>
            </div>


            <div className="resultsGrid">
                {results.length
                    ? results
                        .filter(r =>
                            (!location || r.location.toLowerCase() === location.toLowerCase()) &&
                            (!filters.size || filters.has(r.type))
                        )
                        .map(r => <ResultCard key={r.id} {...r} />)
                    : <p className="noResults">No matches found.</p>}
            </div>
        </div>
    );
}
