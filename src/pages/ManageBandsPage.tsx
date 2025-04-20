import React, { useState, useMemo } from 'react';
import { useBands } from '../context/BandContext';
import { Band } from '../types';
import { Pencil, Save, X } from 'lucide-react';

// Extend type locally if needed for firestoreId
interface BandWithFirestoreId extends Band {
    firestoreId: string; 
}

const ManageBandsPage: React.FC = () => {
  const { bands, updateBand, isLoading, error } = useBands();
  
  // Form state
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Editing State
  const [editingBandFsId, setEditingBandFsId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Edit Handlers
  const handleEditClick = (band: BandWithFirestoreId) => {
      setEditingBandFsId(band.firestoreId);
      setEditingName(band.name);
      setSubmitError(null);
  };

  const handleCancelEdit = () => {
      setEditingBandFsId(null);
      setEditingName('');
      setSubmitError(null);
  };

  const handleSaveEdit = async () => {
      if (!editingBandFsId || !editingName.trim() || isSavingEdit) return;
      setIsSavingEdit(true);
      setSubmitError(null);
      try {
          await updateBand(editingBandFsId, { name: editingName.trim() });
          handleCancelEdit();
      } catch (err) {
          console.error("Save edit error:", err);
          setSubmitError("Fout bij opslaan wijziging.");
      } finally {
          setIsSavingEdit(false);
      }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#004380] mb-6">Bewerk Bandnamen</h1>

      {/* --- Band List (with editing) --- */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold mb-4">Bestaande Bands</h2>
          {isLoading && <p className="text-center text-gray-500">Bands laden...</p>}
          {error && !submitError && <p className="text-center text-red-600">Fout: {error}</p>}
          
          {!isLoading && !error && bands.length === 0 && (
              <p className="text-center text-gray-500">Geen bands gevonden.</p>
          )}
          {!isLoading && !error && bands.length > 0 && (
              <ul className="divide-y divide-gray-200">
                  {bands.map((band: BandWithFirestoreId) => ( 
                      <li key={band.firestoreId} className="py-2 flex justify-between items-center">
                         {editingBandFsId === band.firestoreId ? (
                              <div className="flex-grow flex items-center space-x-2 mr-2">
                                  <span className="font-semibold mr-1">({band.id})</span>
                                  <input 
                                      type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)}
                                      className="flex-grow px-2 py-1 border border-blue-300 rounded-md" autoFocus />
                                  {submitError && <p className="text-red-600 text-xs ml-1">{submitError}</p>}
                                  <button onClick={handleSaveEdit} title="Opslaan"> <Save size={18} /> </button>
                                  <button onClick={handleCancelEdit} title="Annuleren"> <X size={18} /> </button>
                              </div>
                          ) : (
                              <>
                                  <span className="flex-grow mr-2">
                                      <span className="font-semibold mr-2">({band.id})</span>{band.name}
                                  </span>
                                  <button 
                                      onClick={() => handleEditClick(band)}
                                      className="text-blue-600 hover:text-blue-800 text-sm p-1 rounded hover:bg-blue-100 flex-shrink-0"
                                      title="Bewerk naam"
                                  >
                                      <Pencil size={16} />
                                  </button>
                              </>
                          )}
                      </li>
                  ))}
              </ul>
          )}
      </div>
    </div>
  );
};

export default ManageBandsPage; 