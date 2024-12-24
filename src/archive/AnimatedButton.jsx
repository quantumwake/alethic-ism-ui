import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

const AnimatedButton = ({ isRefreshing, toggleIsRefreshing }) => {
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        let intervalId;
        if (isRefreshing) {
            intervalId = setInterval(() => {
                setRotation(prevRotation => (prevRotation + 360) % 360);
            }, 1000);
        } else {
            setRotation(0);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isRefreshing]);

    return (
        <button
            onClick={toggleIsRefreshing}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
        >
            <FontAwesomeIcon
                icon={faSyncAlt}
                className="transition-transform duration-1000 ease-linear"
                style={{ transform: `rotate(${rotation}deg)` }}
            />
        </button>
    );
};

export default AnimatedButton;