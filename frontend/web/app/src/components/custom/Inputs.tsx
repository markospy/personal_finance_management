
interface InputProps {
  title: string;
  name: string;
  type: string;
  required: boolean;
}

interface InputPropsOptions extends InputProps {options?: any}


export function Input({title, name, type, required}: InputProps) {
    return (
      <div className="mb-4">
        <label className="block text-gray-700">{title}</label>
        <input
          name={name}
          type={type}
          className="w-full px-3 py-2 border rounded"
          required={required}
          min={0}
        />
      </div>
    )
  }


export function InputObtions({title, name, type, required, options}: InputPropsOptions) {
  return(
    <div className="mb-4">
      <label className="block text-gray-700">{title}</label>
      <input
        name={name}
        type={type}
        className="w-full px-3 py-2 border rounded"
        list="currencies"
        required={required}
      />
      <datalist id="currencies">
        {options.map((cur, index) => (
            <option key={index} value={cur} />
        ))}
      </datalist>
    </div>
  );
};

export function InputTextTarea({title, name}:{title:string, name: string}) {
  return (
    <div className="mb-4">
      <label className="block mb-2">{title}</label>
      <textarea
        name={name}
        className="w-full p-2 border rounded"
      ></textarea>
    </div>
  );
};

export function InputDate({title, name}:{title:string, name: string}) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return (
    <div className="mb-4">
      <label className="block mb-2">{title}</label>
      <input
        type="date"
        name={name}
        className="w-full p-2 border rounded"
        defaultValue={`${yyyy}-${mm}-${dd}`}
      />
    </div>
  );
};