import React from 'react';
import studentStore from './studentStore';
import markerStore from './markerStore';
import commentLibraryStore from './commentLibraryStore';
import assessmentStore from './assessmentStore';
import projectStore from './projectStore';

const stores = {
  studentStore,
  markerStore,
  commentLibraryStore,
  assessmentStore,
  projectStore,
};

const StoreContext = React.createContext(stores);

export const StoreProvider = ({ children }) => {
  return (
    <StoreContext.Provider value={stores}>{children}</StoreContext.Provider>
  );
};

export const useStores = () => React.useContext(StoreContext);
