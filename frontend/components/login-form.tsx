"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import { authService, ApiError } from "@/lib/api"

export function LoginForm() {
  const router = useRouter()
  const [curp, setCurp] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [curpError, setCurpError] = useState("")
  const [loginError, setLoginError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const validateCURP = (value: string) => {
    // CURP must be exactly 18 alphanumeric characters
    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i

    if (value.length === 0) {
      setCurpError("")
      return
    }

    if (value.length !== 18) {
      setCurpError("El CURP debe tener 18 caracteres")
      return
    }

    if (!curpRegex.test(value)) {
      setCurpError("Formato de CURP inválido")
      return
    }

    setCurpError("")
  }

  const handleCurpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setCurp(value)
    validateCURP(value)
    setLoginError("") // Limpiar error de login al cambiar el CURP
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setLoginError("") // Limpiar error de login al cambiar la contraseña
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    if (curp.length !== 18) {
      setCurpError("El CURP debe tener 18 caracteres")
      return
    }

    if (!curp || !password) {
      setLoginError("Por favor ingresa tu CURP y contraseña")
      return
    }

    if (curpError) {
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.login({ curp, password })
      
      console.log("Login exitoso:", response)
      
      // Redirigir al dashboard o página principal
      router.push("/dashboard")
    } catch (error) {
      console.error("Error en login:", error)
      
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setLoginError("CURP o contraseña incorrectos")
        } else if (error.status === 500) {
          setLoginError("Error en el servidor. Por favor intenta más tarde.")
        } else {
          setLoginError(error.message || "Error al iniciar sesión")
        }
      } else {
        setLoginError("No se pudo conectar con el servidor. Verifica tu conexión.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-4 text-center pb-8">
        <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center">
          <GraduationCap className="w-12 h-12 text-primary-foreground" />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold text-balance">Sistema de Seguimiento Académico</CardTitle>
          <CardDescription className="text-base">Ingresa tus credenciales para acceder</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {loginError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{loginError}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="curp" className="text-sm font-medium">
              CURP
            </Label>
            <Input
              id="curp"
              type="text"
              placeholder="AAAA000000HDFRRR00"
              value={curp}
              onChange={handleCurpChange}
              maxLength={18}
              className={curpError ? "border-destructive focus-visible:ring-destructive" : ""}
              disabled={isLoading}
              required
            />
            {curpError && <p className="text-sm text-destructive">{curpError}</p>}
            <p className="text-xs text-muted-foreground">Ingresa tu CURP de 18 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                className="pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <a href="#" className="text-sm text-accent hover:text-accent/80 transition-colors font-medium">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            disabled={!!curpError || curp.length !== 18 || !password || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Necesitas ayuda?{" "}
            <a href="#" className="text-accent hover:text-accent/80 transition-colors font-medium">
              Contacta soporte
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}