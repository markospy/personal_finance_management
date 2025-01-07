import { ArrowRight, BarChart2, Lock, PiggyBank, Smartphone } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-blue-100 to-white min-h-screen">
      <div className="mx-auto px-4 py-16 container">
        <header className="mb-16 text-center">
          <h1 className="mb-4 font-bold text-4xl text-blue-600">FinanzApp</h1>
          <p className="mb-8 text-gray-600 text-xl">Tu compañero personal para una gestión financiera inteligente</p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Comenzar gratis <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </header>

        <main>
          <section className="mb-16">
            <h2 className="mb-8 font-semibold text-3xl text-center">¿Por qué elegir FinanzApp?</h2>
            <div className="gap-8 grid grid-cols-1 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <PiggyBank className="mb-2 w-10 h-10 text-blue-500" />
                  <CardTitle>Control total de tus finanzas</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Gestiona tus ingresos, gastos y ahorros en un solo lugar.</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart2 className="mb-2 w-10 h-10 text-blue-500" />
                  <CardTitle>Análisis inteligente</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Obtén insights valiosos sobre tus hábitos financieros.</CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Smartphone className="mb-2 w-10 h-10 text-blue-500" />
                  <CardTitle>Acceso en cualquier momento</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Gestiona tus finanzas desde cualquier dispositivo, en cualquier lugar.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-16 text-center">
            <h2 className="mb-4 font-semibold text-3xl">Gratis para siempre</h2>
            <p className="mb-8 text-gray-600 text-xl">
              Creemos que todos merecen tener control sobre sus finanzas. Por eso, FinanzApp es y será siempre gratuita.
            </p>
            <Card className="inline-block">
              <CardHeader>
                <Lock className="mx-auto mb-2 w-10 h-10 text-green-500" />
                <CardTitle>Sin costos ocultos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Todas las funciones disponibles sin cargo alguno.</CardDescription>
              </CardContent>
            </Card>
          </section>

          <section className="text-center">
            <h2 className="mb-8 font-semibold text-3xl">¿Listo para tomar el control de tus finanzas?</h2>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Crear cuenta gratis <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </section>
        </main>

        <footer className="mt-16 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} FinanzApp. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  )
}