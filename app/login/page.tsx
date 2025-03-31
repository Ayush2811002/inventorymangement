"use client";

import type React from "react";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/components/utils/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";  // ✅ Import SweetAlert

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // ✅ Show success message using SweetAlert
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Welcome back!",
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error("Login error:", error);

      // ✅ Show error message using SweetAlert
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password. Please try again.",
        confirmButtonColor: "#dc2626",  // Red color for error alert
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Invoice Management</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="px-0 text-xs text-blue-400">
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
