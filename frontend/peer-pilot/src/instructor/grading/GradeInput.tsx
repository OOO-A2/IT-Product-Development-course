import { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface GradeInputProps {
  value: number;
  onChange: (score: number) => void;
}

export default function GradeInput({ value, onChange }: GradeInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const handleSave = () => {
    const numericValue = Math.max(0, Math.min(100, parseInt(editValue) || 0));
    onChange(numericValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const getGradeColor = (score: number) => {
    return score >= 90 ? 'bg-green-100 text-green-800 hover:bg-green-200' :
           score >= 80 ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
           score >= 70 ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
           score >= 60 ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
           'bg-red-100 text-red-800 hover:bg-red-200';
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            max="100"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-20 px-2 py-1 text-center border-2 border-blue-500 rounded focus:outline-none text-lg font-semibold"
          />
          <button
            onClick={handleSave}
            className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className={`px-4 py-2 rounded-lg font-bold text-lg transition-colors ${getGradeColor(value)}`}
          >
            {value || 0}
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}