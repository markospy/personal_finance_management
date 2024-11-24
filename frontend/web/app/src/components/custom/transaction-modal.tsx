import { useState } from "react";

export const TransactionModal = ({ onClose, onSave }) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
      onSave({ amount, category, date, notes });
    };

    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow-md w-1/3">
          <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
          <div className="mb-4">
            <label className="block mb-2">Amount</label>
            <input 
                type="number" 
                className="w-full p-2 border rounded" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Category</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Date</label>
            <input 
              type="date" 
              className="w-full p-2 border rounded" 
                value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Notes</label>
            <textarea 
              className="w-full p-2 border rounded" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button 
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
              onClick={onClose}
            >
                Cancel
            </button>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleSubmit}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };