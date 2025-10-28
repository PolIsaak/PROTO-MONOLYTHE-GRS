"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, TrendingUp, TrendingDown, GraduationCap, Loader2, ArrowLeft } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import Link from "next/link"
import {
  authService,
  estudianteService,
  type EstudianteProfile,
  type CalificacionesResponse,
  ApiError,
} from "@/lib/api"

type Periodo = 1 | 2 | 3

export function DetailedGradesView() {
  const router = useRouter()
  const [estudiante, setEstudiante] = useState<EstudianteProfile | null>(null)
  const [calificacionesPeriodo1, setCalificacionesPeriodo1] = useState<CalificacionesResponse | null>(null)
  const [calificacionesPeriodo2, setCalificacionesPeriodo2] = useState<CalificacionesResponse | null>(null)
  const [calificacionesPeriodo3, setCalificacionesPeriodo3] = useState<CalificacionesResponse | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<Periodo>(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)

        if (!authService.isAuthenticated()) {
          router.push("/")
          return
        }

        // Obtener perfil
        const profile = await estudianteService.getProfile()
        setEstudiante(profile)

        // Obtener calificaciones de los 3 periodos en paralelo
        const [periodo1, periodo2, periodo3] = await Promise.allSettled([
          estudianteService.getCalificaciones(profile.id, { periodo: 1 }),
          estudianteService.getCalificaciones(profile.id, { periodo: 2 }),
          estudianteService.getCalificaciones(profile.id, { periodo: 3 }),
        ])

        // Procesar resultados
        if (periodo1.status === "fulfilled") setCalificacionesPeriodo1(periodo1.value)
        if (periodo2.status === "fulfilled") setCalificacionesPeriodo2(periodo2.value)
        if (periodo3.status === "fulfilled") setCalificacionesPeriodo3(periodo3.value)

        // Seleccionar el periodo más reciente con datos
        if (periodo3.status === "fulfilled" && periodo3.value.calificaciones.length > 0) {
          setSelectedPeriod(3)
        } else if (periodo2.status === "fulfilled" && periodo2.value.calificaciones.length > 0) {
          setSelectedPeriod(2)
        } else {
          setSelectedPeriod(1)
        }
      } catch (err) {
        console.error("Error al cargar datos:", err)

        if (err instanceof ApiError && err.status === 401) {
          authService.logout()
          router.push("/")
          return
        }

        setError("Error al cargar las calificaciones")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleDownloadReport = () => {
    if (!estudiante || !currentCalificaciones) return

    const nombreCompleto = `${estudiante.nombre} ${estudiante.apellido_paterno} ${estudiante.apellido_materno}`

    // Crear contenido CSV con BOM para UTF-8
    const BOM = "\uFEFF"
    const csvContent =
      BOM +
      [
        ["Reporte de Calificaciones"],
        ["Estudiante:", nombreCompleto],
        ["CURP:", estudiante.curp],
        ["Grado:", `${estudiante.grado}° ${estudiante.grupo}`],
        ["Periodo:", `Trimestre ${selectedPeriod}`],
        ["Fecha:", new Date().toLocaleDateString("es-MX")],
        ["Promedio:", currentCalificaciones.promedio.toFixed(2)],
        ["Materias Reprobadas:", currentCalificaciones.materiasReprobadas.toString()],
        [],
        ["Materia", "Clave", "Calificación", "Estado", "Fecha de Registro"],
        ...currentCalificaciones.calificaciones.map((cal) => [
          cal.materia,
          cal.materia_clave,
          cal.calificacion.toString(),
          cal.calificacion >= 6 ? "Aprobada" : "Reprobada",
          new Date(cal.fecha_registro).toLocaleDateString("es-MX"),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n")

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    const filename = `calificaciones_${estudiante.curp}_trimestre${selectedPeriod}_${Date.now()}.csv`

    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Cargando calificaciones...</p>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error || !estudiante) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error || "No se pudo cargar la información"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Obtener calificaciones del periodo seleccionado
  const currentCalificaciones =
    selectedPeriod === 1
      ? calificacionesPeriodo1
      : selectedPeriod === 2
        ? calificacionesPeriodo2
        : calificacionesPeriodo3

  if (!currentCalificaciones) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Sin Calificaciones</CardTitle>
            <CardDescription>No hay calificaciones registradas para este periodo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calcular datos para las gráficas
  const nombreCompleto = `${estudiante.nombre} ${estudiante.apellido_paterno} ${estudiante.apellido_materno}`

  // Datos de tendencia de rendimiento
  const trendData = [
    calificacionesPeriodo1 && {
      period: "Trimestre 1",
      promedio: calificacionesPeriodo1.promedio,
      aprobadas: calificacionesPeriodo1.calificaciones.length - calificacionesPeriodo1.materiasReprobadas,
      reprobadas: calificacionesPeriodo1.materiasReprobadas,
    },
    calificacionesPeriodo2 && {
      period: "Trimestre 2",
      promedio: calificacionesPeriodo2.promedio,
      aprobadas: calificacionesPeriodo2.calificaciones.length - calificacionesPeriodo2.materiasReprobadas,
      reprobadas: calificacionesPeriodo2.materiasReprobadas,
    },
    calificacionesPeriodo3 && {
      period: "Trimestre 3",
      promedio: calificacionesPeriodo3.promedio,
      aprobadas: calificacionesPeriodo3.calificaciones.length - calificacionesPeriodo3.materiasReprobadas,
      reprobadas: calificacionesPeriodo3.materiasReprobadas,
    },
  ].filter(Boolean)

  // Datos de comparación por materia
  const subjectComparison = currentCalificaciones.calificaciones.map((cal) => ({
    subject: cal.materia.length > 12 ? cal.materia.substring(0, 12) + "..." : cal.materia,
    calificacion: cal.calificacion,
    fullName: cal.materia,
  }))

  const average = currentCalificaciones.promedio
  const failedCount = currentCalificaciones.materiasReprobadas
  const passedCount = currentCalificaciones.calificaciones.length - failedCount

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Link>
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Calificaciones Detalladas</h1>
                <p className="text-sm text-muted-foreground">{nombreCompleto}</p>
                <p className="text-xs text-muted-foreground">
                  {estudiante.grado}° {estudiante.grupo} • CURP: {estudiante.curp}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedPeriod.toString()} onValueChange={(value) => setSelectedPeriod(Number(value) as Periodo)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Seleccionar periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1" disabled={!calificacionesPeriodo1}>
                  Trimestre 1 {!calificacionesPeriodo1 && "(Sin datos)"}
                </SelectItem>
                <SelectItem value="2" disabled={!calificacionesPeriodo2}>
                  Trimestre 2 {!calificacionesPeriodo2 && "(Sin datos)"}
                </SelectItem>
                <SelectItem value="3" disabled={!calificacionesPeriodo3}>
                  Trimestre 3 {!calificacionesPeriodo3 && "(Sin datos)"}
                </SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleDownloadReport} className="gap-2">
              <Download className="w-4 h-4" />
              Descargar Reporte
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Promedio del Periodo</CardDescription>
              <CardTitle
                className={`text-4xl font-bold ${
                  average >= 8 ? "text-green-600" : average >= 7 ? "text-yellow-600" : "text-red-600"
                }`}
              >
                {average.toFixed(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {average >= 7 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span>{currentCalificaciones.calificaciones.length} materias evaluadas</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Materias Aprobadas</CardDescription>
              <CardTitle className="text-4xl font-bold text-green-600">{passedCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {currentCalificaciones.calificaciones.length > 0
                  ? ((passedCount / currentCalificaciones.calificaciones.length) * 100).toFixed(0)
                  : 0}
                % del total
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Materias Reprobadas</CardDescription>
              <CardTitle className="text-4xl font-bold text-red-600">{failedCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {currentCalificaciones.calificaciones.length > 0
                  ? ((failedCount / currentCalificaciones.calificaciones.length) * 100).toFixed(0)
                  : 0}
                % del total
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {trendData.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Rendimiento</CardTitle>
                <CardDescription>Evolución del promedio por trimestre</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    promedio: {
                      label: "Promedio",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="period" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis domain={[0, 10]} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="promedio"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Subject Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Materia</CardTitle>
                <CardDescription>Calificaciones del periodo actual</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    calificacion: {
                      label: "Calificación",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectComparison} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="subject"
                        className="text-xs"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis domain={[0, 10]} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="calificacion" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Grades Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Calificaciones</CardTitle>
            <CardDescription>Todas las materias del Trimestre {selectedPeriod}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Materia</TableHead>
                  <TableHead>Clave</TableHead>
                  <TableHead className="text-center">Calificación</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCalificaciones.calificaciones.length > 0 ? (
                  currentCalificaciones.calificaciones.map((cal) => {
                    const isApproved = cal.calificacion >= 6
                    return (
                      <TableRow
                        key={cal.id}
                        className={!isApproved ? "bg-red-50 dark:bg-red-950/20" : ""}
                      >
                        <TableCell className="font-medium">{cal.materia}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{cal.materia_clave}</TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-bold text-lg ${
                              cal.calificacion >= 8
                                ? "text-green-600"
                                : cal.calificacion >= 7
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {cal.calificacion.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={isApproved ? "default" : "destructive"} className="capitalize font-medium">
                            {isApproved ? "Aprobada" : "Reprobada"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {new Date(cal.fecha_registro).toLocaleDateString("es-MX")}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No hay calificaciones registradas para este periodo
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}