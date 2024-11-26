import { useFetcher } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


export function WrapperForms({title, url, children}: {title: string, url: string, children: React.ReactNode}) {
  const fetcher = useFetcher();

  return (
    <Card className="fixed z-50 inset-y-20 inset-x-1/3 bg-white rounded-lg shadow-lg p-2 max-w-md max-h-fit">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <fetcher.Form method="post" action={url}>
          {children}
        </fetcher.Form>
      </CardContent>
    </Card>
  );
};