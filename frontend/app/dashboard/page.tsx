"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, LogOut, Loader2 } from "lucide-react"
import { authService, estudianteService, type EstudianteProfile } from "@/lib/api"

export default function DashboardPage() {
  const router = useRouter()
  const [estudiante, setEstudiante] = useState<EstudianteProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push("/")
          return
        }

        const profile = await estudianteService.getProfile()
        setEstudiante(profile)
      } catch (error) {
        console.error("Error al cargar perfil:", error)
        authService.logout()
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleLogout = () => {
    authService.logout()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!estudiante) {
    return null
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Sistema de Seguimiento Académico</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Bienvenido, {estudiante.nombre} {estudiante.apellido_paterno}
            </CardTitle>
            <CardDescription>
              {estudiante.grado}° {estudiante.grupo} • CURP: {estudiante.curp}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Tu perfil está configurado correctamente. Próximamente podrás:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Ver tus calificaciones por periodo</li>
                <li>Consultar tu promedio general</li>
                <li>Recibir alertas de materias en riesgo</li>
                <li>Contactar a tus tutores</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}