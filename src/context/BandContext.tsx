import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Band } from '../types'; // Assuming Band type is defined with id: number
import { db } from '../firebase'; 
import { collection, query, getDocs, addDoc, onSnapshot, QuerySnapshot, DocumentData, orderBy, doc, updateDoc } from "firebase/firestore"; 

// Extend Band type used internally in context if needed
interface BandWithFirestoreId extends Band {
    firestoreId: string; 
}

interface BandContextType {
  bands: BandWithFirestoreId[]; // Use extended type internally
  addBand: (bandData: Omit<Band, 'id'> & { id: number }) => Promise<void>; // Expect numeric ID on add
  updateBand: (firestoreId: string, updatedData: Pick<Band, 'name'>) => Promise<void>; // Add update function type - only updating name for now
  isLoading: boolean;
  error: string | null;
}

const BandContext = createContext<BandContextType | undefined>(undefined);
const bandsCollectionRef = collection(db, "bands"); // Firestore collection reference

export const BandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bands, setBands] = useState<BandWithFirestoreId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bands using real-time updates, order by the numeric 'id' field
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    console.log("Setting up listener for bands collection...");

    // Query bands and order by the numeric 'id' field
    const q = query(bandsCollectionRef, orderBy("id", "asc")); 
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        console.log(`Received bands snapshot with ${querySnapshot.docs.length} docs.`);
        const fetchedBands: BandWithFirestoreId[] = [];
        querySnapshot.forEach((doc) => {
          // Data should already include the numeric 'id'
          fetchedBands.push({ firestoreId: doc.id, ...doc.data() } as BandWithFirestoreId); // Add Firestore ID for potential future use (like deletion)
        });
        setBands(fetchedBands);
        setIsLoading(false);
      }, 
      (err) => { 
        console.error("Error fetching bands snapshot:", err);
        setError("Kon bands niet laden.");
        setIsLoading(false);
      }
    );

    return () => {
      console.log("Unsubscribing bands listener.");
      unsubscribe();
    };
  }, []); 

  // Function to add a new band
  // NOTE: This assumes you provide the numeric 'id'. Consider auto-incrementing logic if needed.
  const addBand = useCallback(async (bandData: Omit<Band, 'id'> & { id: number }) => {
    setError(null); 
    // Optional: Check if band with this numeric ID already exists before adding
    // const existing = bands.find(b => b.id === bandData.id);
    // if (existing) {
    //    setError(`Band met ID ${bandData.id} bestaat al.`);
    //    throw new Error(`Band met ID ${bandData.id} bestaat al.`);
    // }
    try {
      console.log("Adding band to Firestore:", bandData);
      // Add the document with the provided data (including numeric id)
      const docRef = await addDoc(bandsCollectionRef, bandData); 
      console.log("Band added with Firestore ID: ", docRef.id);
      // onSnapshot handles state update
    } catch (e) {
      console.error("Error adding band:", e);
      setError("Kon band niet toevoegen.");
      throw e; 
    }
  }, [bands]); // Add bands dependency if doing the existence check

  // --- Function to update a band name ---
  const updateBand = useCallback(async (firestoreId: string, updatedData: Pick<Band, 'name'>) => {
    setError(null);
    try {
      console.log(`Updating band ${firestoreId} with:`, updatedData);
      const bandDocRef = doc(db, "bands", firestoreId); // Reference using Firestore ID
      await updateDoc(bandDocRef, updatedData); // Update the document
      console.log(`Band ${firestoreId} updated successfully.`);
      // onSnapshot handles state update
    } catch (e) {
      console.error(`Error updating band ${firestoreId}:`, e);
      setError("Kon bandnaam niet bijwerken.");
      throw e; 
    }
  }, []); 
  // --- End update function ---

  return (
    <BandContext.Provider value={{ 
      bands, 
      addBand,
      updateBand, // Provide the new function
      isLoading,
      error
    }}>
      {children}
    </BandContext.Provider>
  );
};

// Custom hook to use the BandContext
export const useBands = (): BandContextType => {
  const context = useContext(BandContext);
  if (context === undefined) {
    throw new Error('useBands must be used within a BandProvider');
  }
  return context;
}; 