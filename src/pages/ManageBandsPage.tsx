import React, { useState, useMemo } from 'react';
import { useBands } from '../context/BandContext';
import { Band } from '../types';
import { Pencil, Save, X, Plus, Trash2 } from 'lucide-react';

// Extend type locally if needed for firestoreId
interface BandWithFirestoreId extends Band {
    firestoreId: string;
}

const ManageBandsPage: React.FC = () => {
  const { bands, addBand, updateBand, deleteBand, isLoading, error } = useBands();
  const [deletingFsId, setDeletingFsId] = useState<string | null>(null);

  const handleDelete = async (band: BandWithFirestoreId) => {
      if (deletingFsId) return;
      if (!window.confirm(`Band "${band.name}" (ID ${band.id}) verwijderen?`)) return;
      setDeletingFsId(band.firestoreId);
      try {
          await deleteBand(band.firestoreId);
      } catch (err) {
          console.error("Delete band error:", err);
          window.alert("Fout bij verwijderen band.");
      } finally {
          setDeletingFsId(null);
      }
  };

  // Form state
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Editing State
  const [editingBandFsId, setEditingBandFsId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // --- Add form state ---
  const nextId = useMemo(() => {
      if (bands.length === 0) return 1;
      return Math.max(...bands.map(b => b.id)) + 1;
  }, [bands]);
  const [newId, setNewId] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);

  const handleAddBand = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newName.trim() || isAdding) return;
      const idToUse = newId.trim() === '' ? nextId : Number(newId);
      if (!Number.isInteger(idToUse) || idToUse <= 0) {
          setAddError("ID moet een positief geheel getal zijn.");
          return;
      }
      if (bands.some(b => b.id === idToUse)) {
          setAddError(`Band met ID ${idToUse} bestaat al.`);
          return;
      }
      setIsAdding(true);
      setAddError(null);
      try {
          await addBand({ id: idToUse, name: newName.trim() });
          setNewId('');
          setNewName('');
      } catch (err) {
          console.error("Add band error:", err);
          setAddError("Fout bij toevoegen band.");
      } finally {
          setIsAdding(false);
      }
  };

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

      {/* --- Add Band Form --- */}
      {bands.length < 20 && (
      <div className="bg-white rounded-lg shadow-md p-4 max-w-lg mx-auto mb-6">
          <h2 className="text-lg font-semibold mb-3 text-[#004380]">Band toevoegen</h2>
          <form onSubmit={handleAddBand} className="flex flex-col sm:flex-row sm:items-end gap-2">
              <div className="sm:w-20">
                  <label className="block text-xs text-gray-600 mb-1">ID</label>
                  <input
                      type="number"
                      min={1}
                      value={newId}
                      onChange={(e) => setNewId(e.target.value)}
                      placeholder={String(nextId)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
              </div>
              <div className="flex-grow">
                  <label className="block text-xs text-gray-600 mb-1">Naam</label>
                  <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Bandnaam"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
              </div>
              <button
                  type="submit"
                  disabled={isAdding || !newName.trim()}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <Plus size={16} />
                  {isAdding ? 'Bezig...' : 'Toevoegen'}
              </button>
          </form>
          {addError && <p className="text-red-600 text-xs mt-2">{addError}</p>}
      </div>
      )}

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
                                  <button
                                      onClick={() => handleDelete(band)}
                                      disabled={deletingFsId === band.firestoreId}
                                      className="text-red-600 hover:text-red-800 text-sm p-1 rounded hover:bg-red-100 flex-shrink-0 ml-1 disabled:opacity-50"
                                      title="Verwijder band"
                                  >
                                      <Trash2 size={16} />
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