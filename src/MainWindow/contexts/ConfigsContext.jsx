// System
import React, { createContext, useState, useContext } from 'react';
// User


// Context
const ConfigsContext = createContext();

// useContext
const useConfigsContext = () => {
    return useContext(ConfigsContext);
};

// Context Provider
const ConfigsProvider = ({ children }) => {
    const [configs, setConfigs] = useState({
        // Initial Configs
        filterTagNames: ["address", "article", "aside", "footer", "header", "h1", "h2", "h3", "h4", "h5", "h6", "main", "nav", "section"],
        filterAttributes: ["role", "aria-label"],
        adoptRange: {
            leaf: 1,
            root: 1
        },
        generalDataCollection: {
            coordinates: true,
            overlapAll: true,
            overlapFiltered: true
        },
        elementDataCollection: {
            tagName: true,
            attributes: ["id", "role", "aria-label"]
        }
    });
    // JSX
    return (
        <ConfigsContext.Provider value={ { configs, setConfigs } }>
          { children }
        </ConfigsContext.Provider>
    );
};


export {
    useConfigsContext,
    ConfigsProvider
};
