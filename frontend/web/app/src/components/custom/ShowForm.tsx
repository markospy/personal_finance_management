import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
  onClick: () => void;
}

export function ButtonShowForm({title, children, onClick}:Props) {
    return (
      <button
        className="w-full mt-4 py-2 flex justify-center items-center bg-blue-500 text-white rounded shadow-md font-medium hover:opacity-95"
        onClick={onClick}
      >
        { children }
        { title }
      </button>
    );
};
