export function Input({title, name, type, required}: {title: string, name: string, type: string, required: boolean}) {
    return (
      <div className="mb-4">
        <label className="block text-gray-700">{title}</label>
        <input
          name={name}
          type={type}
          className="w-full px-3 py-2 border rounded"
          required={required}
        />
      </div>
    )
  }


export function InputObtions({title, name, type, required, options}: {title: string, name: string, type: string, required: boolean, options: any}) {
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
    )
  }