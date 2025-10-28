"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  GraduationCap, 
  LogOut,
  Loader2,
  RefreshCw
} from "lucide-react"
import { 
  authService, 
  estudianteService,
  type EstudianteProfile,
  type CalificacionesResponse,
  type RiesgoResponse,
  ApiError
} from "@/lib/api"

export function StudentDashboard() {
  const router = useRouter()
  const [estudiante, setEstudiante] = useState<EstudianteProfile | null>(null)
  const [calificaciones, setCalificaciones] = useState<CalificacionesResponse | null>(null)
  const [riesgo, setRiesgo] = useState<RiesgoResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      setError(null)
      
      // Verificar autenticación
      if (!authService.isAuthenticated()) {
        router.push("/")
        return
      }

      // Obtener perfil del estudiante
      const profile = await estudianteService.getProfile()
      setEstudiante(profile)

      // Obtener calificaciones y riesgo en paralelo
      const [cals, risk] = await Promise.all([
        estudianteService.getCalificaciones(profile.id),
        estudianteService.getRiesgo(profile.id)
      ])

      setCalificaciones(cals)
      setRiesgo(risk)
    } catch (err) {
      console.error("Error al cargar datos:", err)
      
      if (err instanceof ApiError) {
        if (err.status === 401) {
          // Token inválido, redirigir al login
          authService.logout()
          router.push("/")
          return
        }
        setError(err.message)
      } else {
        setError("Error al cargar los datos. Por favor intenta de nuevo.")
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [router])

  const handleLogout = () => {
    authService.logout()
    router.push("/")
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
  }

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Cargando información académica...</p>
        </div>
      </div>
    )
  }

  if (error && !estudiante) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleRefresh} className="w-full" disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reintentando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </>
              )}
            </Button>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Volver al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!estudiante || !calificaciones || !riesgo) {
    return null
  }

  // Calcular datos derivados
  const nombreCompleto = `${estudiante.nombre} ${estudiante.apellido_paterno} ${estudiante.apellido_materno}`
  const isAtRisk = riesgo.enRiesgo.status
  const averageColor =
    calificaciones.promedio >= 8
      ? "text-green-600"
      : calificaciones.promedio >= 7
        ? "text-yellow-600"
        : "text-red-600"

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header con logout */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Sistema de Seguimiento Académico</h1>
              <p className="text-xs text-muted-foreground">
                {estudiante.grado}° {estudiante.grupo}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleRefresh} 
              variant="ghost" 
              size="sm"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Título de bienvenida */}
        <div className="flex items-center gap-3 pb-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-balance">
              Bienvenido, {nombreCompleto}
            </h2>
            <p className="text-sm text-muted-foreground">CURP: {estudiante.curp}</p>
          </div>
        </div>

        {/* Alerta de riesgo académico */}
        {isAtRisk && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>⚠️ Alerta Académica</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Estás en riesgo académico por las siguientes razones:</p>
                <ul className="list-disc list-inside space-y-1">
                  {riesgo.enRiesgo.razones.map((razon, index) => (
                    <li key={index}>{razon}</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm">
                  Te recomendamos buscar apoyo académico lo antes posible para mejorar tu rendimiento.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Tarjetas de resumen académico */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Promedio General */}
          <Card>
            <CardHeader>
              <CardDescription>Promedio General</CardDescription>
              <CardTitle className={`text-4xl font-bold ${averageColor}`}>
                {calificaciones.promedio.toFixed(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {calificaciones.promedio >= 7 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span>De {calificaciones.calificaciones.length} materias</span>
              </div>
            </CardContent>
          </Card>

          {/* Materias Reprobadas */}
          <Card>
            <CardHeader>
              <CardDescription>Materias Reprobadas</CardDescription>
              <CardTitle className="text-4xl font-bold text-red-600">
                {calificaciones.materiasReprobadas}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {calificaciones.calificaciones.length > 0
                    ? ((calificaciones.materiasReprobadas / calificaciones.calificaciones.length) * 100).toFixed(0)
                    : 0}
                  % del total
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Estado Académico */}
          <Card>
            <CardHeader>
              <CardDescription>Estado Académico</CardDescription>
              <CardTitle className="text-2xl font-bold">
                <Badge variant={isAtRisk ? "destructive" : "default"} className="text-base px-3 py-1">
                  {isAtRisk ? "En riesgo" : "Normal"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {isAtRisk ? "Requiere atención inmediata" : "Desempeño satisfactorio"}
              </div>
              {isAtRisk && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>Criterios:</p>
                  <ul className="list-disc list-inside">
                    <li>Promedio mínimo: {riesgo.criterios.promedioMinimo}</li>
                    <li>Máx. reprobadas: {riesgo.criterios.materiasReprobadasMaximo}</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabla de calificaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Calificaciones por Materia</CardTitle>
            <CardDescription>
              Detalle de tu rendimiento académico en cada asignatura - Periodo {calificaciones.periodo}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Materia</TableHead>
                  <TableHead className="text-center">Calificación</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Periodo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calificaciones.calificaciones.length > 0 ? (
                  calificaciones.calificaciones.map((calificacion) => {
                    const isApproved = calificacion.calificacion >= 6
                    return (
                      <TableRow key={calificacion.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{calificacion.materia}</div>
                            <div className="text-xs text-muted-foreground">
                              {calificacion.materia_clave}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-bold ${
                              calificacion.calificacion >= 8
                                ? "text-green-600"
                                : calificacion.calificacion >= 7
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {calificacion.calificacion.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={isApproved ? "default" : "destructive"} 
                            className="capitalize"
                          >
                            {isApproved ? "Aprobada" : "Reprobada"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {calificacion.periodo}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No hay calificaciones registradas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}