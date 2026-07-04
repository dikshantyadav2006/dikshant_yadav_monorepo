import React from 'react';

/**
 * BackgroundLayers
 * Renders the two fixed background panels used for dark/light transitions.
 * Extracted from App.jsx for reuse and clarity.
 */
const BackgroundLayers = ({ isDarkMode }) => {
    return (
        <>
            <div
                className={`background w-screen h-[100%] absolute z-[-1] top-0 left-0 pointer-events-none origin-left bg-[--dark-color] ${isDarkMode ? "scale-x-100 origin-left transform transition-all duration-500" : "scale-x-0 origin-left transform transition-all duration-500"}`}
            />
            <div className="background w-screen h-[100%] absolute z-[-2] top-0 left-0 pointer-events-none origin-left bg-[--light-color]" />
        </>
    );
};

export default BackgroundLayers;
