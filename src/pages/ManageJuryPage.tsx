import React, { useState } from 'react';
import { useJury } from '../context/JuryContext';
import { stages } from '../data/initialData'; // Keep using static stages for now
import { JuryMember } from '../types';
import { Pencil, Save, X } from 'lucide-react'; // Added icons

const ManageJuryPage: React.FC = () => {
  const { juryMembers, updateJuryMember, isLoading, error } = useJury();
  
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // --- Group and Sort Jury Members ---
  const juryByStage = !isLoading && !error ? juryMembers.reduce((acc, member) => {
      const stageIdStr = String(member.stageId); // Use string ID consistently
      if (!acc[stageIdStr]) {
          acc[stageIdStr] = [];
      }
      acc[stageIdStr].push(member);
      return acc;
  }, {} as Record<string, JuryMember[]>) : {};

  // Sort members within each stage group (Muzikaliteit first)
  for (const stageIdKey in juryByStage) {
      juryByStage[stageIdKey].sort((a, b) => {
          if (a.type === 'muzikaliteit' && b.type === 'show') return -1;
          if (a.type === 'show' && b.type === 'muzikaliteit') return 1;
          return a.name.localeCompare(b.name); // Secondary sort by name
      });
  }
  // --- End Grouping and Sorting ---

  const handleEditClick = (member: JuryMember) => {
      setEditingMemberId(member.id);
      setEditingName(member.name);
      setSubmitError(null);
  };

  const handleCancelEdit = () => {
      setEditingMemberId(null);
      setEditingName('');
      setSubmitError(null);
  };

  const handleSaveEdit = async () => {
      if (!editingMemberId || !editingName.trim() || isSavingEdit) return;

      setIsSavingEdit(true);
      setSubmitError(null);
      try {
          await updateJuryMember(editingMemberId, { name: editingName.trim() });
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
      <h1 className="text-2xl font-bold text-[#004380] mb-6">Bewerk Jurynamen</h1>

      {/* --- Jury Member List (Grouped) --- */}
      <div className="max-w-2xl mx-auto">
          {isLoading && <p className="text-center text-gray-500 bg-white p-6 rounded-lg shadow-md">Juryleden laden...</p>}
          {error && <p className="text-center text-red-600 bg-white p-6 rounded-lg shadow-md">Fout: {error}</p>}
          
          {!isLoading && !error && juryMembers.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                 <p className="text-center text-gray-500">Geen juryleden gevonden.</p>
              </div>
          )}

          {!isLoading && !error && juryMembers.length > 0 && (
              <div className="space-y-6"> {/* Spacing between stage cards */}
                 {stages.map(stage => {
                     const membersForStage = juryByStage[String(stage.id)] || [];
                     // Only render stage if there are members for it
                     if (membersForStage.length === 0) return null; 

                     return (
                          <div key={stage.id} className="bg-white rounded-lg shadow-md">
                              {/* Stage Header */}
                              <h2 className="text-lg font-semibold p-3 bg-blue-50 rounded-t-md text-blue-800 border-b">
                                  {stage.name}
                              </h2>
                              {/* Member List for this stage */}
                              <ul className="divide-y divide-gray-200 px-3"> 
                                  {membersForStage.map(member => ( 
                                      <li key={member.id} className="py-3 flex justify-between items-center">
                                          {editingMemberId === member.id ? (
                                              // --- Edit Mode ---
                                              <div className="flex-grow flex items-center space-x-2 mr-2">
                                                  {/* Input for name */}
                                                  <input 
                                                    type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)}
                                                    className="flex-grow px-2 py-1 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                    autoFocus
                                                  />
                                                  {/* Error display */}
                                                  {submitError && <p className="text-red-600 text-xs ml-1">{submitError}</p>}
                                                  {/* Save Button */}
                                                  <button 
                                                      onClick={handleSaveEdit}
                                                      disabled={isSavingEdit || !editingName.trim()}
                                                      className={`p-1 rounded text-green-600 hover:bg-green-100 disabled:opacity-50 ${isSavingEdit ? 'cursor-wait' : ''}`}
                                                      title="Opslaan"
                                                  >
                                                      <Save size={18} />
                                                  </button>
                                                  {/* Cancel Button */}
                                                  <button 
                                                      onClick={handleCancelEdit}
                                                      disabled={isSavingEdit}
                                                      className="p-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                                      title="Annuleren"
                                                  >
                                                      <X size={18} />
                                                  </button>
                                              </div>
                                          ) : (
                                              // --- Display Mode ---
                                              <>
                                                  {/* Member Info */}
                                                  <div className="flex-grow mr-2"> {/* Added flex-grow and margin */}
                                                      <p className="font-medium">{member.name}</p>
                                                      <p className={`text-sm ${
                                                          member.type === 'muzikaliteit' ? 'text-blue-600' : 'text-green-600'
                                                      }`}>
                                                          {member.type === 'muzikaliteit' ? 'Muzikaliteit' : 'Show'}
                                                      </p>
                                                  </div>
                                                  {/* Edit Button */}
                                                  <button 
                                                      onClick={() => handleEditClick(member)}
                                                      className="text-blue-600 hover:text-blue-800 text-sm p-1 rounded hover:bg-blue-100 flex-shrink-0" // Added flex-shrink-0
                                                      title="Bewerk naam"
                                                  >
                                                      <Pencil size={16} />
                                                  </button>
                                              </>
                                          )}
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      );
                    })}
              </div>
          )}
      </div>
    </div>
  );
};

export default ManageJuryPage; 