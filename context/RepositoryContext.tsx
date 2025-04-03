/**
 * FILE: context/RepositoryContext.tsx
 * PURPOSE: Provides a React context for accessing the sobriety data repository instance (LocalStorageSobrietyRepository).
 * FUNCTIONS:
 *   - RepositoryProvider(props: { children: ReactNode }) → JSX.Element: Context provider component.
 *   - useRepository() → ISobrietyDataRepository: Hook to access the repository instance from context.
 * DEPENDENCIES: react, ../lib/types/repositories, ../lib/storage/LocalStorageSobrietyRepository
 */
import React, { createContext, useContext, ReactNode } from "react";
import { ISobrietyDataRepository } from "../lib/types/repositories";
import { LocalStorageSobrietyRepository } from "../lib/storage/LocalStorageSobrietyRepository";

// Create the repository instance
const repositoryInstance = new LocalStorageSobrietyRepository();

// Create the context
export const RepositoryContext = createContext<
	ISobrietyDataRepository | undefined
>(undefined); // Export this

// Create a provider component
interface RepositoryProviderProps {
	children: ReactNode;
}

export const RepositoryProvider: React.FC<RepositoryProviderProps> = ({
	children,
}) => {
	return (
		<RepositoryContext.Provider value={repositoryInstance}>
			{children}
		</RepositoryContext.Provider>
	);
};

// Create a hook to use the context
export const useRepository = (): ISobrietyDataRepository => {
	const context = useContext(RepositoryContext);
	if (context === undefined) {
		throw new Error("useRepository must be used within a RepositoryProvider");
	}
	return context;
};
