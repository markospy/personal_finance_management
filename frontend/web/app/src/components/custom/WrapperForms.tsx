import { useFetcher } from "react-router-dom";

export function WrapperForms({title, url, children}: {title: string, url: string, children: React.ReactNode}) {
  const fetcher = useFetcher();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">{title}</h2>
        <fetcher.Form method="post" action={url}>
          {children}
        </fetcher.Form>
      </div>
    </div>
  );
};
