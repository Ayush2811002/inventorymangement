// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { useAuth } from "@/lib/auth"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Button } from "@/components/ui/button"
// import { useToast } from "@/components/ui/use-toast"

// export default function ProfilePage() {
//   const { user } = useAuth()
//   const [name, setName] = useState("")
//   const [email, setEmail] = useState("")
//   const [role, setRole] = useState("Unknown") // Default value for role
//   const { addToast } = useToast()

//   useEffect(() => {
//     console.log("User data:", user) // Debugging step
//     if (user) {
//       setName(user.name || "")
//       setEmail(user.email || "")
//     //   setRole(user.role || "Unknown") // Handle missing role
//     }
//   }, [user])

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     addToast({
//       title: "Profile updated",
//       description: "Your profile has been successfully updated.",
//     })
//   }

//   if (!user) {
//     return null // Auth provider will handle redirect
//   }

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <h1 className="text-4xl font-bold text-white mb-8">Profile</h1>
//       <Card className="bg-gray-800 border-gray-700">
//         <CardHeader>
//           <CardTitle className="text-2xl text-white">User Information</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="space-y-2">
//               <Label htmlFor="name" className="text-gray-300">
//                 Name
//               </Label>
//               <Input
//                 id="name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="bg-gray-700 text-white border-gray-600"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="email" className="text-gray-300">
//                 Email
//               </Label>
//               <Input
//                 id="email"
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="bg-gray-700 text-white border-gray-600"
//                 disabled
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="role" className="text-gray-300">
//                 Role
//               </Label>
//               <Input id="role" value={role} className="bg-gray-700 text-white border-gray-600" disabled />
//             </div>
//             <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
//               Update Profile
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
"use client";

import type React from "react";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { updateProfile } from "firebase/auth";
import { auth } from "@/components/utils/firebaseConfig";
import Swal from "sweetalert2"; // ✅ Import SweetAlert

export default function ProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });

      // ✅ Show success message using SweetAlert
      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been successfully updated.",
        timer: 2000,
        showConfirmButton: false,
      });

    } catch (error) {
      console.error("Error updating profile:", error);

      // ✅ Show error message using SweetAlert
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "There was an error updating your profile. Please try again.",
        confirmButtonColor: "#dc2626", // Red for error
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-4xl font-bold text-white mb-8">Profile Settings</h1>

      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription className="text-gray-400">Update your personal information</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-gray-700 border-gray-600"
              />
              <p className="text-xs text-gray-400">Your email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
