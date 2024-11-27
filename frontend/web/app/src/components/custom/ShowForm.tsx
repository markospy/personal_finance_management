interface Props {
  title: string;
  onClick: () => void;
}

export function ButtonShowForm({title, onClick}:Props) {
    return (
      <button
      className="bg-blue-500 text-white px-4 py-2 rounded mb-4 shadow-md font-medium hover:shadow-xl hover:bg-white hover:text-blue-500 hover:font-bold hover:outline"
      onClick={onClick}
      >
      {title}
      </button>
    );
};
