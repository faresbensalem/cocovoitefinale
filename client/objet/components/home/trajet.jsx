"use client";
import { FaCircleArrowLeft, FaCircleArrowRight } from "react-icons/fa6";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Liste des images disponibles
const images = [
  "/img/montreal.jpeg",
  "/img/moncton.jpeg",
  "/img/ottawa.jpeg",
  "/img/quebec.jpeg",
  "/img/toronto.jpeg",
  "/img/vancouver.jpeg",
];

// Fonction pour choisir une image au hasard
const getRandomImage = () => {
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};

export default function Trajet() {
  const [trajets, setTrajets] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const cardContainerRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    const fetchTrajets = async () => {
      try {
        const res = await fetch("http://localhost:5000/trajets");
        const data = await res.json();

        // Ajoute une image aléatoire à chaque trajet
        const trajetsAvecImage = data.map((trajet) => ({
          ...trajet,
          image: getRandomImage(),
        }));

        setTrajets(trajetsAvecImage);
      } catch (err) {
        console.error("Erreur de chargement des trajets :", err);
      }
    };
    fetchTrajets();
  }, []);

  if (!isClient) return null;

  const scrollByCard = (direction) => {
    const container = cardContainerRef.current;
    const cardWidth = 300 + 16; // largeur + gap
    if (container) {
      container.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative my-10 mx-[138px]">
      <FaCircleArrowLeft
        onClick={() => scrollByCard("left")}
        className="absolute left-[-50px] top-1/2 transform -translate-y-1/2 text-4xl text-gray-700 cursor-pointer z-20"
      />
      <FaCircleArrowRight
        onClick={() => scrollByCard("right")}
        className="absolute right-[-50px] top-1/2 transform -translate-y-1/2 text-4xl text-gray-700 cursor-pointer z-20"
      />

      <div className="overflow-hidden">
        <div
          ref={cardContainerRef}
          className="flex gap-4 overflow-x-hidden scroll-smooth"
        >
          {trajets.map((trajet, index) => {
            const dateSimple = new Date(trajet.date).toISOString().split("T")[0];

            return (
              <div
                key={`${trajet.id}-${index}`}
                className="bg-white rounded-2xl shadow-lg overflow-hidden w-[300px] flex-shrink-0 min-h-[350px] flex flex-col"
              >
                <Image
                  src={trajet.image}
                  alt={trajet.destination}
                  width={600}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {trajet.depart} → {trajet.destination}
                    </h2>
                    <p className="text-gray-600">Date : {dateSimple}</p>
                    <p className="text-gray-600">Places : {trajet.places}</p>
                    <p className="text-gray-600">Prix : {trajet.prix} $</p>
                  </div>
                       <a
  href={`/trajetdetail/${trajet.id}`}
  target="_blank"
  rel="noopener noreferrer"
  className="bg-blue-600 text-white px-6 py-2 rounded-md mt-2 hover:bg-[#2f855a] transition-colors inline-block text-center"
>
 
Réserver
</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
