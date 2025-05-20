"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useAuth } from "@/context/authContext"
import { toast } from "sonner"

const LoginPage = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Remove the redirection logic that's causing the loop
    // We'll only check session status once when component mounts
    const checkSession = () => {
      const session = localStorage.getItem("session")
      if (session) {
        router.replace("/dashboard")
      }
    }

    checkSession()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (username === "admin" && password === "admin") {
      // First set the session data
      localStorage.setItem("session", JSON.stringify({ username, role: "admin" }))
      await login({ username, role: "admin" })

      // Show toast
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema de gestión",
      })

      // Use replace instead of push to avoid adding to history stack
      router.replace("/dashboard")
    } else {
      toast.error("Credenciales incorrectas")
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="block text-gray-700 text-sm font-bold mb-2">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
