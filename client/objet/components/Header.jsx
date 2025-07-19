"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCar, FaSearchLocation, FaRegUserCircle, FaMapSigns } from "react-icons/fa";
import { CiCirclePlus, CiBookmarkCheck } from "react-icons/ci";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import logo from "@/public/img/cocologo.png";

export default function Header({ changePage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("http://localhost:5000/check-session", {
          credentials: "include",
        });
        
        if (!res.ok) throw new Error("Session invalide");
        
        const data = await res.json();
        if (data.isAuthenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Erreur session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include",
      });
      
      if (res.ok) {
        setUser(null);
        setUserMenuOpen(false);
        window.location.href = '/';
      }
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  };

  if (loading) {
    return <div className="w-full h-16 bg-white shadow-md"></div>;
  }

  return (
    <header className="relative flex justify-between items-center px-10 py-6 bg-white w-full shadow-md font-sans">
      {/* Logo à gauche */}
      <div className="flex items-center">
        <Link href="/">
          <Image src={logo} alt="Logo" width={200} height={80} priority />
        </Link>
      </div>

      {/* Liens centrés */}
      <nav className={`absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-10 text-gray-700 font-semibold text-base ${
        menuOpen ? "flex-col space-y-4 mt-4" : "hidden md:flex"
      }`}>
        {/* Liens toujours visibles */}
        <button
          onClick={() => changePage("recherche")}
          className="flex items-center space-x-2 hover:text-gray-900 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          <FaSearchLocation className="text-2xl" />
          <span>Recherche</span>
        </button>

        {!user ? (
          // Lien visible uniquement pour les visiteurs non connectés
          <Link
            href="/connexion"
            className="flex items-center space-x-2 hover:text-gray-900 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <CiCirclePlus className="text-2xl" />
            <span>Publier un trajet fares</span>
          </Link>
        ) : (
          // Liens visibles uniquement pour les utilisateurs connectés
          <>
            <button
              onClick={() => changePage("publier")}
              className="flex items-center space-x-2 hover:text-gray-900 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <CiCirclePlus className="text-2xl" />
              <span>Publier un trajet</span>
            </button>
            <Link
              href="/mestrajet"
              className="flex items-center space-x-2 hover:text-gray-900 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <FaMapSigns className="text-2xl" />
              <span>trajets</span>
            </Link>
            <Link
              href="/reservations"
              className="flex items-center space-x-2 hover:text-gray-900 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <CiBookmarkCheck className="text-2xl" />
              <span>réservations</span>
            </Link>
            <Link
              href="/voiture"
              className="flex items-center space-x-2 hover:text-gray-900 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <FaCar className="text-2xl" />
              <span>mon auto</span>
            </Link>
          </>
        )}
      </nav>

      {/* Menu utilisateur */}
      <div className="relative flex items-center">
        {user && (
          <span className="mr-4 text-gray-700 font-semibold hidden md:inline-block">
            Bonjour, {user.nom || user.email}
          </span>
        )}
        <button
          onClick={toggleUserMenu}
          className="flex items-center space-x-2 text-gray-700 font-semibold text-lg hover:text-gray-900 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          <FaRegUserCircle className="text-2xl" />
          {userMenuOpen ? (
            <IoIosArrowUp className="text-xl" />
          ) : (
            <IoIosArrowDown className="text-xl" />
          )}
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50 text-gray-700 font-medium top-full">
            {user ? (
              <>
                <div className="px-4 py-2 border-b bg-gray-50">
                  <div className="font-semibold">👋 {user.nom || user.email}</div>
                  <Link
                    href="/profile"
                    className="block text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Voir mon profil
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="block px-4 py-2 hover:bg-gray-100 transition"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="block px-4 py-2 hover:bg-gray-100 transition"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Burger menu mobile */}
      <div
        className="md:hidden text-2xl text-gray-700 cursor-pointer"
        onClick={toggleMenu}
      >
        {menuOpen ? (
          <IoIosArrowUp className="text-3xl" />
        ) : (
          <IoIosArrowDown className="text-3xl" />
        )}
      </div>
    </header>
  );
}
