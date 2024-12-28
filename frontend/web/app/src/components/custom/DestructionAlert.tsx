import { TriangleAlert } from "lucide-react";

interface Props {
  id: number;
  info: string;
  description: string;
  token: string;
  onAction: (token:string, id:number) => unknown;
  setShow: (value: boolean) => void;
}

export default function DestructionAlert({id, info, description, token, onAction, setShow}:Props) {


  return (
    <div className='top-0 left-0 fixed flex justify-center items-center w-full min-h-screen' >
      <div className='space-y-6 bg-red-100 p-6 rounded-md animate-slide-in-bottom align-middle'>
        <div className='flex gap-2'>
          <TriangleAlert className='flex-none text-red-500'/>
          <p className='font-medium text-red-500'>{description} {info}?</p>
        </div>
        <div className='flex justify-center gap-4'>
          <button className='bg-gray-400 hover:bg-gray-600 p-2 rounded-md text-base text-white' onClick={() => setShow(false)}>Cancel</button>
          <button
            className="bg-red-400 hover:bg-red-600 p-2 rounded-md text-base text-white" 
            onClick={async() => {
              await onAction(token, id);
              setShow(false);
            }}
          >
            Delete
          </button>
        </div>
        </div>
    </div>
  )
}
