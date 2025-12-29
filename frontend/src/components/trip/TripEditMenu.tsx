import React, { useState } from 'react';
import { MoreVertical, Edit3, Image, Trash2 } from 'lucide-react';
import { Trip } from '../../types';

interface TripEditMenuProps {
  trip: Trip;
  onEditName: (newName: string) => void;
  onEditImage: (newImage: string) => void;
  onDelete: () => void;
}

const TripEditMenu: React.FC<TripEditMenuProps> = ({
  trip,
  onEditName,
  onEditImage,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState<'name' | 'image' | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (type: 'name' | 'image') => {
    setEditType(type);
    setEditValue(type === 'name' ? trip.name : trip.coverImage);
    setShowEditModal(true);
    setIsOpen(false);
  };

  const handleSave = () => {
    if (editType === 'name') {
      onEditName(editValue);
    } else if (editType === 'image') {
      onEditImage(editValue);
    }
    setShowEditModal(false);
    setEditValue('');
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Edit trip"
        >
          <MoreVertical className="w-5 h-5 text-white" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg py-2 z-50 min-w-48">
            <button
              onClick={() => handleEdit('name')}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Name</span>
            </button>
            <button
              onClick={() => handleEdit('image')}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            >
              <Image className="w-4 h-4" />
              <span>Change Background</span>
            </button>
            <hr className="my-2" />
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Trip</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              Edit {editType === 'name' ? 'Trip Name' : 'Background Image'}
            </h3>
            <input
              type={editType === 'image' ? 'url' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={editType === 'name' ? 'Enter trip name' : 'Enter image URL'}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600"
              >
                Save
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TripEditMenu;
