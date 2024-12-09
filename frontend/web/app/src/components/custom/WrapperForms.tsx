import { useFetcher } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import './Spinner.css';

interface Props {
  title: string;
  url: string;
  children: React.ReactNode;
  onClick: () => void
}

export function WrapperForms({title, url, children, onClick}:Props ) {
  const fetcher = useFetcher();
  const busy = fetcher.state !== 'idle';
  // useEffect(() => {
  //   if (busy) {
  //     onClick(); // Llama a la función que cierra el modal
  //   }
  // }, [busy, onClick]);

  return (
    <Card className="fixed z-50 inset-y-20 inset-x-1/3 bg-white rounded-lg shadow-lg p-2 max-w-md max-h-fit">
      {fetcher.state!=='idle' && <div className="absolute inset-0 bg-white opacity-50"></div>}
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <fetcher.Form method="post" action={url} >
          <>
            {children}
          </>
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
              onClick={onClick}
              disabled={fetcher.state!=='idle'}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex gap-2 items-center bg-blue-500 text-white py-2 px-4 rounded"
              disabled={fetcher.state!=='idle'}
            >
              {fetcher.state!=='idle' && <div className="spinner"/>}
              Create
            </button>
          </div>
        </fetcher.Form>
      </CardContent>
    </Card>
  );
};