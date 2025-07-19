"use client";
import { useState, useEffect } from "react";
import {
  FaDog,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaDollarSign,
  FaUsers,
  FaCreditCard,
  FaRegClock,
  FaArrowLeft
} from "react-icons/fa";
import { MdLuggage } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TrajetDetail({ params }) {
  const { id } = params;
  const router = useRouter();
  const [trajet, setTrajet] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nbPlaces, setNbPlaces] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("http://localhost:5000/check-session", {
          credentials: "include",
        });
        
        if (!res.ok) {
          throw new Error("Session invalide");
        }
        
        const data = await res.json();
        if (data.isAuthenticated && data.user) {
          setUser(data.user);
        } else {
          router.push('/connexion');
        }
      } catch (error) {
        console.error("Erreur session:", error);
        setError("Vous devez être connecté pour accéder à cette page");
      }
    };

    const fetchTrajet = async () => {
      try {
        const res = await fetch(`http://localhost:5000/trajets/${id}`, {
          credentials: "include"
        });
        
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération du trajet");
        }
        
        const data = await res.json();
        setTrajet(data);
      } catch (error) {
        console.error("Erreur:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
    fetchTrajet();
  }, [id, router]);

  const handleReservation = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("Vous devez être connecté pour réserver");
      router.push('/connexion');
      return;
    }

    if (trajet.conducteurId === user.id) {
      setError("Vous ne pouvez pas réserver votre propre trajet");
      return;
    }

    if (nbPlaces > trajet.places) {
      setError("Nombre de places demandé non disponible");
      return;
    }

    // Si toutes les vérifications sont passées, afficher le formulaire de paiement
    setShowPayment(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError(null);
    setProcessing(true);

    try {
      // Créer la réservation
      const resReservation = await fetch("http://localhost:5000/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          trajetId: trajet.id,
          nbPlaces: parseInt(nbPlaces)
        }),
      });

      if (!resReservation.ok) {
        const errorData = await resReservation.json();
        throw new Error(errorData.error || "Échec de la réservation");
      }

      const reservation = await resReservation.json();

      // Créer le paiement
      const resPaiement = await fetch("http://localhost:5000/paiements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reservationId: reservation.id,
          montant: trajet.prix * nbPlaces,
          fournisseur: "STRIPE",
          cardInfo: paymentInfo // Ces informations ne seront pas stockées, c'est juste pour la simulation
        }),
      });

      if (!resPaiement.ok) {
        const errorData = await resPaiement.json();
        throw new Error(errorData.error || "Échec du paiement");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/reservations');
      }, 2000);
    } catch (error) {
      console.error("Erreur:", error);
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">⚠️</div>
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
              {!user && (
                <Link href="/connexion" className="text-red-700 underline">
                  Se connecter
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trajet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Trajet non trouvé</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-green-500">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Réservation confirmée !</h2>
          <p className="text-gray-600 mb-6">
            Votre réservation a été effectuée avec succès. Vous allez être redirigé vers vos réservations...
          </p>
        </div>
      </div>
    );
  }

  const renderPaymentForm = () => (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Paiement</h2>
        <button
          onClick={() => setShowPayment(false)}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaArrowLeft className="text-xl" />
        </button>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-sm text-blue-700 font-medium mb-2">
          Ceci est un paiement factice pour la démonstration. Utilisez ces informations de test :
        </p>
        <ul className="text-sm text-blue-700 list-disc list-inside">
          <li>Numéro de carte : 4242 4242 4242 4242</li>
          <li>Date d'expiration : MM/AA future (ex: 12/25)</li>
          <li>CVC : 3 chiffres (ex: 123)</li>
        </ul>
      </div>

      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom sur la carte
          </label>
          <input
            type="text"
            value={paymentInfo.cardName}
            onChange={(e) => setPaymentInfo({...paymentInfo, cardName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro de carte
          </label>
          <input
            type="text"
            value={paymentInfo.cardNumber}
            onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="4242 4242 4242 4242"
            pattern="[0-9]{4} [0-9]{4} [0-9]{4} [0-9]{4}"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'expiration
            </label>
            <input
              type="text"
              value={paymentInfo.expiry}
              onChange={(e) => setPaymentInfo({...paymentInfo, expiry: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="MM/AA"
              pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVC
            </label>
            <input
              type="text"
              value={paymentInfo.cvc}
              onChange={(e) => setPaymentInfo({...paymentInfo, cvc: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="123"
              pattern="[0-9]{3}"
              required
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={processing}
            className={`w-full px-6 py-3 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 ${
              processing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>Traitement en cours...</span>
              </>
            ) : (
              <>
                <FaCreditCard />
                <span>Payer {(trajet.prix * nbPlaces).toFixed(2)} €</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  if (showPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        {renderPaymentForm()}
      </div>
    );
  }

  return (
    <div className="flex p-8 space-x-6">
      {/* Colonne gauche */}
      <div className="flex-2 space-y-6 w-2/3">
        {/* Détails du trajet */}
        <div className="p-6 rounded-xl shadow-2xl bg-white border border-gray-200">
          <h1 className="text-3xl font-semibold text-gray-800 mb-4">Détails du trajet</h1>
          <h1 className="text-2xl text-gray-900 mb-4">
            <div className="flex items-center">
              <FaRegClock className="text-blue-500 mr-2" />
              <strong>
                {new Date(trajet.date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </strong>
            </div>
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

          <div className="flex items-center mb-4">
            <FaUsers className="text-blue-500 text-2xl mr-3" />
            <p className="text-lg text-gray-700">
              <strong>Conducteur :</strong> {trajet.conducteur.nom}
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
                Animaux {trajet.animauxAcceptes ? "autorisés" : "non autorisés"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MdLuggage className={`text-2xl ${trajet.bagagesAcceptes ? "text-green-600" : "text-red-600"}`} />
              <span className="text-lg text-gray-700">
                Bagages {trajet.bagagesAcceptes ? "autorisés" : "non autorisés"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne droite : Réservation */}
      <div className="w-1/3">
        <div className="sticky top-4 p-6 rounded-2xl shadow-2xl bg-white border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Réservation</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <p className="text-lg text-gray-700 flex items-center">
              <FaUsers className="mr-3 text-blue-500 text-xl" />
              <span className="font-medium">Places disponibles :</span>
              <span className="ml-2">{trajet.places}</span>
            </p>

            <p className="text-lg text-gray-700 flex items-center">
              <FaDollarSign className="mr-3 text-green-500 text-xl" />
              <span className="font-medium">Prix par place :</span>
              <span className="ml-2">{trajet.prix} €</span>
            </p>
          </div>

          <form onSubmit={handleReservation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de places à réserver
              </label>
              <select
                value={nbPlaces}
                onChange={(e) => setNbPlaces(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={processing}
              >
                {[...Array(Math.min(trajet.places, 8))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i + 1 === 1 ? "place" : "places"} - {((i + 1) * trajet.prix).toFixed(2)} €
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FaCreditCard />
              <span>Continuer vers le paiement</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
