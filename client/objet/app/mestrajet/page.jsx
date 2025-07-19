'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaUsers, FaEuroSign, FaChevronDown, FaChevronUp, FaCheckCircle } from 'react-icons/fa';

export default function MesTrajets() {
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTrajet, setExpandedTrajet] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [confirmationError, setConfirmationError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTrajets = async () => {
      try {
        setError(null);
        const response = await fetch('http://localhost:5000/mes-trajets', {
          credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de la récupération des trajets');
        }

        // Trier les trajets par date, du plus récent au plus ancien
        const sortedTrajets = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log("Trajets reçus:", sortedTrajets); // Debug
        setTrajets(sortedTrajets);
      } catch (error) {
        console.error("Erreur:", error);
        if (error.message === "Non authentifié") {
          router.push('/connexion');
        } else {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrajets();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAge = (dateNaissance) => {
    if (!dateNaissance) return 'Non spécifié';
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} ans`;
  };

  const isTrajetPasse = (date) => {
    return new Date(date) < new Date();
  };

  const handleConfirmTrajet = async (trajetId) => {
    try {
      setConfirming(trajetId);
      setConfirmationError(null);
      
      const response = await fetch(`http://localhost:5000/trajets/${trajetId}/confirmer`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la confirmation du trajet');
      }

      // Mettre à jour la liste des trajets
      setTrajets(trajets.map(trajet => 
        trajet.id === trajetId ? data : trajet
      ));

      // Afficher un message de succès temporaire
      setConfirmationError({ type: 'success', message: 'Trajet confirmé avec succès !' });
      setTimeout(() => setConfirmationError(null), 3000);

    } catch (error) {
      console.error('Erreur:', error);
      setConfirmationError({ type: 'error', message: error.message });
    } finally {
      setConfirming(null);
    }
  };

  // Fonction pour séparer les trajets
  const separerTrajets = (trajets) => {
    const maintenant = new Date();
    return {
      trajetsEffectues: trajets.filter(t => t.effectue || new Date(t.date) < maintenant),
      trajetsEnCours: trajets.filter(t => !t.effectue && new Date(t.date) >= maintenant)
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg flex flex-col items-center">
            <p className="text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { trajetsEffectues, trajetsEnCours } = separerTrajets(trajets);

  const TrajetCard = ({ trajet, isEffectue }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-lg font-semibold mb-2">
              <FaMapMarkerAlt className="text-green-500" />
              <span className="truncate">{trajet.depart}</span>
              <span className="mx-2">→</span>
              <FaMapMarkerAlt className="text-red-500" />
              <span className="truncate">{trajet.destination}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FaCalendarAlt />
                {formatDate(trajet.date)}
              </div>
              <div className="flex items-center gap-1">
                <FaUsers />
                {trajet.places} places
              </div>
              <div className="flex items-center gap-1">
                <FaEuroSign />
                {trajet.prix}€
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {/* Bouton de confirmation pour les trajets passés non effectués */}
            {isTrajetPasse(trajet.date) && !trajet.effectue && (
              <button
                onClick={() => handleConfirmTrajet(trajet.id)}
                disabled={confirming === trajet.id}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  confirming === trajet.id
                    ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                <FaCheckCircle className={confirming === trajet.id ? 'animate-spin' : ''} />
                {confirming === trajet.id ? 'Confirmation...' : 'Confirmer trajet effectué'}
              </button>
            )}
            
            {/* Badge pour les trajets effectués */}
            {trajet.effectue && (
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                <FaCheckCircle />
                Trajet effectué
              </div>
            )}

            {/* Bouton pour voir les réservations */}
            <button
              onClick={() => setExpandedTrajet(expandedTrajet === trajet.id ? null : trajet.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                trajet.reservations.length > 0 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-500 cursor-default'
              }`}
            >
              {trajet.reservations.length > 0 ? (
                <>
                  <span className="font-medium">
                    Voir les réservations ({trajet.reservations.length})
                  </span>
                  {expandedTrajet === trajet.id ? <FaChevronUp /> : <FaChevronDown />}
                </>
              ) : (
                <span>Aucune réservation</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Section des réservations */}
      {expandedTrajet === trajet.id && trajet.reservations.length > 0 && (
        <div className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Passagers</h3>
          <div className="grid gap-4">
            {trajet.reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <FaUser className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{reservation.passager.nom}</p>
                      <p className="text-sm text-gray-600">
                        {calculateAge(reservation.passager.dateNaissance)}
                        {reservation.passager.numero && ` • ${reservation.passager.numero}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{reservation.nbPlaces} place(s)</p>
                    <p className="text-sm text-gray-600">
                      Statut: <span className={`font-medium ${
                        reservation.statut === 'CONFIRMEE' ? 'text-green-600' :
                        reservation.statut === 'EN_ATTENTE' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {reservation.statut}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto"> {/* Augmentation de la largeur maximale pour accommoder 2 colonnes */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mes Trajets Publiés</h1>
        
        </div>

        {confirmationError && (
          <div className={`mb-4 p-4 rounded-lg ${
            confirmationError.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-400'
              : 'bg-red-100 text-red-700 border border-red-400'
          }`}>
            {confirmationError.message}
          </div>
        )}
        
        {trajets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-600 mb-4">Vous n'avez pas encore publié de trajets.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Publier un trajet
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Colonne gauche : Trajets en cours et à venir */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-blue-600">
                  <FaMapMarkerAlt className="text-blue-500" />
                  Trajets en cours et à venir
                  <span className="ml-2 text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    {trajetsEnCours.length}
                  </span>
                </h2>
                {trajetsEnCours.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Aucun trajet en cours ou à venir
                  </p>
                ) : (
                  <div className="space-y-4">
                    {trajetsEnCours.map(trajet => (
                      <TrajetCard key={trajet.id} trajet={trajet} isEffectue={false} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite : Trajets effectués */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-green-600">
                  <FaCheckCircle className="text-green-500" />
                  Trajets effectués
                  <span className="ml-2 text-sm bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    {trajetsEffectues.length}
                  </span>
                </h2>
                {trajetsEffectues.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Aucun trajet effectué
                  </p>
                ) : (
                  <div className="space-y-4">
                    {trajetsEffectues.map(trajet => (
                      <TrajetCard key={trajet.id} trajet={trajet} isEffectue={true} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}