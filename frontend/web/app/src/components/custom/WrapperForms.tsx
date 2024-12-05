import { useFetcher } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Props {
  title: string;
  url: string;
  children: React.ReactNode;
  onClick: () => void
}

export function WrapperForms({title, url, children, onClick}:Props ) {
  const fetcher = useFetcher();

  const handleSubmitClick = () => {
    // Llama a la función onClick
    if (onClick) {
      onClick();
    }
    // No llamamos a event.preventDefault() para permitir que el formulario se envíe
  };

  return (
    <Card className="fixed z-50 inset-y-20 inset-x-1/3 bg-white rounded-lg shadow-lg p-2 max-w-md max-h-fit">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <fetcher.Form method="post" action={url}>
          <>
            {children}
          </>
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
              onClick={onClick}
            >
              Cancel
            </button>
            <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Create
            </button>
          </div>
        </fetcher.Form>
      </CardContent>
    </Card>
  );
};