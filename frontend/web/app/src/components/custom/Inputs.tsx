import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InputProps {
  title: string;
  name: string;
  type: string;
  required: boolean;
  placeholder: string
}

export function Input({title, name, type, required, placeholder}: InputProps) {
  return (
    <div className="mb-2">
      <label className="block text-gray-700">{title}</label>
      <input
        name={name}
        type={type}
        className="w-full px-3 py-2 border rounded"
        required={required}
        min={0}
        placeholder={placeholder}
      />
    </div>
  )
}

interface SelectScrollableProps {
  title: string;
  name: string;
  options: Record<string, string[]>
  placeholder: string;
}


export function SelectScrollable({title, name, options, placeholder}: SelectScrollableProps) {


  return (
    <Select name={name}>
      <label className="block text-gray-700">{title}</label>
      <SelectTrigger className="w-full mb-2 h-10">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options &&
          (
            Object.keys(options).map(option => (
              <SelectGroup key={option}>
                <SelectLabel >{option.toUpperCase()}</SelectLabel>
                {options[option].map(value => (
                  <SelectItem value={value}>{value}</SelectItem>
                ))}
              </SelectGroup>
            ))
          )
        }
      </SelectContent>
    </Select>
  )
}

type CurrencyCode = string; // Definición de CurrencyCode
interface SelectCurrencyProps {
  title: string;
  name: string;
  options: CurrencyCode[]; // Cambiar a un array de CurrencyCode
  placeholder: string;
}

export function SelectCurrency({ title, name, options, placeholder }: SelectCurrencyProps) {
  return (
    <Select name={name}>
      <label className="block text-gray-700">{title}</label>
      <SelectTrigger className="w-full mb-2 h-10">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options && options.length > 0 && (
          <SelectGroup>
            <SelectLabel>{title.toUpperCase()}</SelectLabel>
            {options.map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency} {/* Mostrar el código de la moneda */}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}

export function InputTextTarea({title, name}:{title:string, name: string}) {
  return (
    <div className="mb-2">
      <label className="block">{title}</label>
      <textarea
        name={name}
        placeholder="Add a comment"
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
  const HH = String(today.getHours()).padStart(2, '0')
  const MM = String(today.getMinutes()).padStart(2, '0')

  return (
    <div className="mb-2">
      <label className="block">{title}</label>
      <input
        type="datetime-local"
        name={name}
        className="w-full p-2 border rounded"
        defaultValue={`${yyyy}-${mm}-${dd} ${HH}:${MM}`}
      />
    </div>
  );
};