"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Publier from "@/components/home/publier";
import Recherche from "@/components/home/recherche";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
    const [currentPage, setCurrentPage] = useState("accueil");

    // Cette fonction permet de changer la page
    const changePage = (page) => {
        setCurrentPage(page);
    };

    return (
        <html lang="en">
            <body className="flex flex-col min-h-screen">
                <Header changePage={changePage} />
                <main className="flex-1">
                    {/* Affichage conditionnel des pages */}
                    {currentPage === "accueil" ? (
                        children
                    ) : currentPage === "publier" ? (
                        <Publier />
                    ) : currentPage === "recherche" ? (
                        <Recherche />
                    ) : (
                        <div>404 : Page introuvable</div>
                    )}
                </main>
                <Footer />
            </body>
        </html>
    );
}
