"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/components/utils/firebaseConfig";
import { Bell, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import logo from "/public/final.png";
import Swal from "sweetalert2";  // ✅ Import SweetAlert

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
const handleProfileClick = () => {
  setDropdownOpen(false); // Close the dropdown
  router.push("/profile"); // Navigate to profile page
};

  const handleLogout = async () => {
    const confirmLogout = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, logout",
    });

    if (confirmLogout.isConfirmed) {
      await signOut(auth);
      router.push("/login");  // Redirect to login page after logout
    }
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 py-4 px-6 flex justify-between items-center relative">
      <div className="flex items-center space-x-3">
        {/* ✅ Sidebar Toggle Button for Mobile */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
          <Menu className="h-6 w-6 text-gray-400" />
        </Button>

        <Image src={logo} alt="ShwetShree Logo" width={40} height={40} />
        <h1 className="text-2xl font-bold text-white">ShwetShree Enterprises</h1>
      </div>

      <div className="flex items-center space-x-4 relative">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5 text-gray-400" />
        </Button>

        {/* ✅ User Icon with Dropdown */}
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <User className="h-5 w-5 text-gray-400" />
          </Button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-700 text-white rounded-md shadow-lg overflow-hidden">
              {/* <button
                className="block w-full px-4 py-2 text-left hover:bg-gray-600"
                onClick={() => router.push("/profile")}  // ✅ Navigate to profile
              >
                Profile
              </button> */}
              <button className="block w-full px-4 py-2 text-left hover:bg-gray-600" onClick={handleProfileClick}>
  Profile
</button>

              <button
                className="block w-full px-4 py-2 text-left hover:bg-red-600"
                onClick={handleLogout}  // ✅ Call logout function
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
