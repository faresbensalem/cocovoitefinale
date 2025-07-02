"use client";
import { useState, useEffect } from "react";
import { FaDog, FaLocationArrow, FaMapMarkerAlt, FaDollarSign, FaUsers } from "react-icons/fa";
import { MdLuggage } from "react-icons/md";

export default function TrajetDetail({ params }) {
  const { id } = params;
  const [trajet, setTrajet] = useState(null);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const fetchTrajet = async () => {
      try {
        const res = await fetch(`http://localhost:5000/trajets/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Erreur lors de la récupération du trajet");
        const data = await res.json();
        setTrajet(data);
      } catch (err) {
        setError(err.message);
        console.error("Erreur côté client :", err.message);
      }
    };
    fetchTrajet();
  }, [id]);

  if (error) {
    return (
      <div className="p-6 text-red-600">
        <h1>Erreur</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!trajet) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="flex p-8 space-x-6">
      {/* Colonne gauche */}
      <div className="flex-2 space-y-6 w-2/3">
        {/* Détails du trajet */}
        <div className="p-6 rounded-xl shadow-2xl bg-white border border-gray-200">
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">Détails du trajet</h1>
          <h1 className="text-2xl text-gray-900 mb-4">
            <strong>
              {new Date(trajet.date).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </strong>
          </h1>

          <div className="flex items-center mb-4">
            <FaLocationArrow className="text-green-500 text-2xl mr-3" />
            <p className="text-lg text-gray-700">
              <strong>Départ :</strong> {trajet.depart} - {trajet.adresseDepart}
            </p>
          </div>

          <div className="flex items-center mb-4">
            <FaMapMarkerAlt className="text-red-500 text-2xl mr-3" />
            <p className="text-lg text-gray-700">
              <strong>Destination :</strong> {trajet.destination} - {trajet.adresseArrivee}
            </p>
          </div>
        </div>

        {/* Préférences */}
        <div className="p-6 rounded-xl shadow-2xl bg-white border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Préférences de trajet</h2>
          <div className="flex items-center mt-4 space-x-6">
            <div className="flex items-center space-x-2">
              <FaDog className={`text-2xl ${trajet.animauxAcceptes ? "text-green-600" : "text-red-600"}`} />
              <span className="text-lg text-gray-700">
                {trajet.animauxAcceptes ? "Autorisé" : "Non autorisé"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MdLuggage className={`text-2xl ${trajet.bagagesAcceptes ? "text-green-600" : "text-red-600"}`} />
              <span className="text-lg text-gray-700">
                {trajet.bagagesAcceptes ? "Autorisé" : "Non autorisé"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne droite : Réservation / Paiement */}
      <div className="w-1/3 p-6 rounded-2xl shadow-2xl bg-white border border-gray-100 transition-all duration-500 ease-in-out">
        {!showPayment ? (
          <div key="reservation" className="fade-slide flex flex-col justify-between h-full">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Réservation</h2>
              <h1 className="text-xl text-gray-600 mb-4">
                <span className="block text-gray-700 font-semibold">
                  {new Date(trajet.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </h1>

              <p className="text-lg text-gray-700 flex items-center mb-3">
                <FaUsers className="mr-3 text-blue-500 text-xl" />
                <span className="font-medium">Places disponibles :</span>
                <span className="ml-2">{trajet.places}</span>
              </p>

              <p className="text-lg text-gray-700 flex items-center">
                <FaDollarSign className="mr-3 text-green-500 text-xl" />
                <span className="font-medium">Prix :</span>
                <span className="ml-2">{trajet.prix} €</span>
              </p>
            </div>

            <button
              onClick={() => setShowPayment(true)}
              className="mt-8 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 transition duration-200 text-white font-semibold rounded-xl shadow-md"
            >
              Réserver maintenant
            </button>
          </div>
        ) : (
          <div key="paiement" className="fade-slide">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Paiement</h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Nom sur la carte"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                placeholder="Numéro de carte"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="MM/AA"
                  className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  placeholder="CVC"
                  className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setShowPayment(false)}
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  Payer
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
