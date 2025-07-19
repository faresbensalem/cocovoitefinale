'use client';

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Publier from "@/components/home/publier";
import Recherche from "@/components/home/recherche";
import "./globals.css";

export default function RootLayout({ children }) {
  const [currentPage, setCurrentPage] = useState("accueil");

  // Cette fonction permet de changer la page pour les composants dynamiques
  const changePage = (page) => {
    if (page === "accueil") {
      window.location.href = '/';
      return;
    }
    setCurrentPage(page);
  };

  // Si nous sommes sur une route Next.js (comme /reservations), afficher directement children
  if (typeof window !== 'undefined' && 
      window.location.pathname !== '/' && 
      !['publier', 'recherche'].includes(currentPage)) {
    return (
      <html lang="fr">
        <body className="flex flex-col min-h-screen">
          <Header changePage={changePage} />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    );
  }

  // Sinon, gérer les pages dynamiques
  return (
    <html lang="fr">
      <body className="flex flex-col min-h-screen">
        <Header changePage={changePage} />
        <main className="flex-grow">
          {currentPage === "accueil" ? (
            children
          ) : currentPage === "publier" ? (
            <Publier />
          ) : currentPage === "recherche" ? (
            <Recherche />
          ) : (
            children
          )}
        </main>
        <Footer />
      </body>
    </html>
  );
}
