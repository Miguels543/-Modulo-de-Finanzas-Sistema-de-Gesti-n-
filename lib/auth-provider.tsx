"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  username: string
  role: string
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: User) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Marcar que estamos en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Cargar usuario desde localStorage solo en el cliente
  useEffect(() => {
    if (isClient) {
      try {
        const storedSession = localStorage.getItem("session")
        if (storedSession) {
          setUser(JSON.parse(storedSession))
        }
      } catch (error) {
        console.error("Error al cargar la sesión:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }, [isClient])

  const login = async (userData: User) => {
    try {
      setIsLoading(true)
      // Guardar en localStorage
      localStorage.setItem("session", JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      // Eliminar de localStorage
      localStorage.removeItem("session")
      setUser(null)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
