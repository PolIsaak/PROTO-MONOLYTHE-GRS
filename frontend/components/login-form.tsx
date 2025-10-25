"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Eye, EyeOff } from "lucide-react"

export function LoginForm() {
  const [curp, setCurp] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [curpError, setCurpError] = useState("")

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
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (curp.length !== 18) {
      setCurpError("El CURP debe tener 18 caracteres")
      return
    }

    if (!curpError && curp && password) {
      console.log("Login attempt:", { curp, password })
      // Handle login logic here
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
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
            disabled={!!curpError || curp.length !== 18 || !password}
          >
            Iniciar Sesión
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
