"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCar } from "react-icons/fa";
import logo from "@/public/img/cocologo.png";
import { CiCirclePlus } from "react-icons/ci";
import { FaSearchLocation, FaRegUserCircle } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FaMapSigns } from "react-icons/fa";
import { CiBookmarkCheck } from "react-icons/ci";

export default function Header({ changePage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  return (
    <header className="relative flex justify-between items-center px-10 py-6 bg-white w-full shadow-md font-sans">
      {/* Logo à gauche */}
      <div className="flex items-center">
        <a href="/">
          <Image src={logo} alt="Logo" width={200} height={80} />
        </a>
      </div>

      {/* Liens centrés */}
      <nav
        className={`absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-10 text-gray-700 font-semibold text-base ${
          menuOpen ? "flex-col space-y-4 mt-4" : "hidden md:flex"
        }`} // Ajout du flex-col et espace vertical sur mobile
      >
        <button
          onClick={() => changePage("publier")}
          className="flex items-center space-x-2 hover:text-gray-900 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          <CiCirclePlus className="text-2xl" />
          <span>Publier un trajet</span>
        </button>
        <button
          onClick={() => changePage("recherche")}
          className="flex items-center space-x-2 hover:text-gray-900 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          <FaSearchLocation className="text-2xl" />
          <span>Recherche</span>
        </button>
        <Link
          href="/mestrajet"
          className="flex items-center space-x-2 hover:text-gray-900 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          <FaMapSigns className="text-2xl" />
          <span>trajets</span>
        </Link>
        <button
          onClick={() => changePage("reservations")}
          className="flex items-center space-x-2 hover:text-gray-900 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          <CiBookmarkCheck className="text-2xl" />
          <span>réservations</span>
        </button>
        <Link
          href="/voiture"
          className="flex items-center space-x-2 hover:text-gray-900 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          <FaCar className="text-2xl" />
          <span>mon auto</span>
        </Link>
      </nav>

      {/* Utilisateur + flèche à droite */}
      <div className="relative">
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
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 text-gray-700 font-medium">
            <a
              href="#"
              onClick={() => changePage("connexion")}
              className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-300"
            >
              Connexion
            </a>
            <a
              href="#"
              onClick={() => changePage("inscription")}
              className="block px-4 py-2 hover:bg-gray-100 transition-colors duration-300"
            >
              Inscription
            </a>
          </div>
        )}
      </div>

      {/* Burger Menu (mobile) */}
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
