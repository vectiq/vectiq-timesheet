import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import { useUsers } from '@/lib/hooks/useUsers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface EffectiveTimesheetUserContextType {
    effectiveTimesheetUser: User | null;
    handleSetEffectiveUser: (user: User | null) => void;
    resetEffectiveTimesheetUser: () => void;
}

const EffectiveTimesheetUserContext = createContext<EffectiveTimesheetUserContextType | undefined>(undefined);

interface EffectiveTimesheetUserProviderProps {
    children: React.ReactNode;
}

export const EffectiveTimesheetUserProvider: React.FC<EffectiveTimesheetUserProviderProps> = ({ children }) => {
    const queryClient = useQueryClient();
    const {currentUser} = useUsers();
    const [effectiveTimesheetUser, setEffectiveTimesheetUser] = useState<User | null>(null);

    const resetEffectiveTimesheetUser = useCallback(() => {
        if(currentUser != null){
            console.log("resetting user to: ", currentUser);
            setEffectiveTimesheetUser(currentUser);
        }
    }, [currentUser]);

    useEffect(() => {
        // Always set effective user to current user initially
        if (currentUser && !effectiveTimesheetUser) {
            console.log("seting initial user", currentUser);
            setEffectiveTimesheetUser(currentUser);
        }
      }, [currentUser, effectiveTimesheetUser]);

    function handleSetEffectiveUser(user: User) {
        if (currentUser?.role === 'admin') {
            setEffectiveTimesheetUser(user);
            queryClient.invalidateQueries({ queryKey: ['timeEntries', 'approvals', 'projects'] });
            console.log("Effective user changed:", user);
        }
    }

    return (
        <EffectiveTimesheetUserContext.Provider value={{ effectiveTimesheetUser, handleSetEffectiveUser, resetEffectiveTimesheetUser }}>
            {children}
        </EffectiveTimesheetUserContext.Provider>
    );
};

export const useEffectiveTimesheetUser = () => {
    const context = useContext(EffectiveTimesheetUserContext);
    
    if (!context) {
        throw new Error('useEffectiveTimesheetUser must be used within an EffectiveTimesheetUserProvider');
    }
    return context;
};

