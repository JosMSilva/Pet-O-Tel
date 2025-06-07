import React, { useState } from 'react';
import './ServiceSelector.css';

export default function PetServiceSelector({ services, selected, setSelected }) {
    const handleClick = (id) => {
        const alreadySelected = selected.includes(id);
        const newSelected = alreadySelected
            ? selected.filter(x => x !== id)
            : [...selected, id];

        setSelected(newSelected);
    };

    return (
        <div className="service-selector">
            {services.map(s => (
                <div key={s.id} className='serviceContainer' onClick={() => handleClick(s.id)}>
                    <div className={`service-box ${selected.includes(s.id) ? 'selected' : ''}`}>
                        <img src={`/Images/${s.icon}`} alt={s.label} />
                        {selected.includes(s.id) && (
                            <div className="checkmark">
                                <i className="fa fa-check"></i>
                            </div>
                        )}
                    </div>
                    <div className="label">{s.label}</div>
                </div>
            ))}
        </div>
    );
}