import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { JuryMember } from '../types'; // Assuming JuryMember type is defined
import { db } from '../firebase'; // Import Firestore instance
import { collection, query, getDocs, addDoc, onSnapshot, QuerySnapshot, DocumentData, doc, updateDoc } from "firebase/firestore";

interface JuryContextType {
  juryMembers: JuryMember[];
  addJuryMember: (memberData: Omit<JuryMember, 'id'>) => Promise<void>; // Exclude ID for adding
  updateJuryMember: (id: string, updatedData: Partial<Pick<JuryMember, 'name' | 'type' | 'stageId'>>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const JuryContext = createContext<JuryContextType | undefined>(undefined);
const juryCollectionRef = collection(db, "juryMembers"); // Firestore collection reference

export const JuryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [juryMembers, setJuryMembers] = useState<JuryMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch jury members using real-time updates (onSnapshot)
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    console.log("Setting up listener for juryMembers collection...");

    const q = query(juryCollectionRef); 
    
    // onSnapshot listens for real-time updates
    const unsubscribe = onSnapshot(q, 
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        console.log(`Received juryMembers snapshot with ${querySnapshot.docs.length} docs.`);
        const fetchedMembers: JuryMember[] = [];
        querySnapshot.forEach((doc) => {
          // Important: Map Firestore doc ID to the 'id' field
          fetchedMembers.push({ id: doc.id, ...doc.data() } as JuryMember); 
        });
        setJuryMembers(fetchedMembers);
        setIsLoading(false);
      }, 
      (err) => { // Handle errors from the listener
        console.error("Error fetching jury members snapshot:", err);
        setError("Kon juryleden niet laden.");
        setIsLoading(false);
      }
    );

    // Cleanup function to unsubscribe the listener when the component unmounts
    return () => {
      console.log("Unsubscribing juryMembers listener.");
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to add a new jury member
  const addJuryMember = useCallback(async (memberData: Omit<JuryMember, 'id'>) => {
    setError(null); // Clear previous errors
    try {
      console.log("Adding jury member to Firestore:", memberData);
      // Add the document, Firestore generates the ID
      const docRef = await addDoc(juryCollectionRef, memberData); 
      console.log("Jury member added with ID: ", docRef.id);
      // No need to manually update state here, onSnapshot will handle it
    } catch (e) {
      console.error("Error adding jury member:", e);
      setError("Kon jurylid niet toevoegen.");
      // Re-throw error if needed by the calling component
      throw e; 
    }
  }, []); // useCallback dependency array

  // --- Function to update a jury member ---
  const updateJuryMember = useCallback(async (id: string, updatedData: Partial<Pick<JuryMember, 'name' | 'type' | 'stageId'>>) => {
      setError(null);
      try {
          console.log(`Updating jury member ${id} with:`, updatedData);
          const memberDocRef = doc(db, "juryMembers", id); // Get reference to the specific document
          await updateDoc(memberDocRef, updatedData); // Update the document
          console.log(`Jury member ${id} updated successfully.`);
          // No need to update state manually, onSnapshot handles it
      } catch (e) {
          console.error(`Error updating jury member ${id}:`, e);
          setError("Kon jurylid niet bijwerken.");
          throw e; // Re-throw error
      }
  }, []); // Empty dependency array, relies on closure for db reference
  // --- End update function ---

  return (
    <JuryContext.Provider value={{ 
      juryMembers, 
      addJuryMember,
      updateJuryMember,
      isLoading,
      error
    }}>
      {children}
    </JuryContext.Provider>
  );
};

// Custom hook to use the JuryContext
export const useJury = (): JuryContextType => {
  const context = useContext(JuryContext);
  if (context === undefined) {
    throw new Error('useJury must be used within a JuryProvider');
  }
  return context;
}; 