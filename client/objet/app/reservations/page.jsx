'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaMapMarkerAlt, FaCalendar, FaUser, FaCar, FaStar as FaStarSolid, FaCheckCircle } from 'react-icons/fa';
import { FiStar } from 'react-icons/fi';

// Composant ReservationCard séparé avec ses propres états
const ReservationCard = ({ reservation, onEvaluation, submitting }) => {
  const voiture = reservation.trajet.conducteur.voitures[0];
  const [localNote, setLocalNote] = useState(0);
  const [localCommentaire, setLocalCommentaire] = useState('');
  const [evaluationActive, setEvaluationActive] = useState(false);
  
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

  const handleSubmitEvaluation = async () => {
    if (localNote > 0 && localCommentaire.trim()) {
      await onEvaluation(reservation.id, reservation.trajet.conducteur.id, localNote, localCommentaire);
      setLocalNote(0);
      setLocalCommentaire('');
      setEvaluationActive(false);
    }
  };

  const handleCancel = () => {
    setEvaluationActive(false);
    setLocalNote(0);
    setLocalCommentaire('');
  };

  // Debug pour comprendre pourquoi l'évaluation ne s'affiche pas
  const canEvaluate = reservation.statut === 'CONFIRMEE' && 
                     reservation.trajet.effectue === true && 
                     !reservation.avis;
  
  console.log('Reservation debug:', {
    id: reservation.id,
    statut: reservation.statut,
    effectue: reservation.trajet.effectue,
    date: reservation.trajet.date,
    datePassed: new Date(reservation.trajet.date) < new Date(),
    avis: reservation.avis,
    canEvaluate
  });
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          {/* Informations principales */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-lg font-semibold mb-3">
              <FaMapMarkerAlt className="text-green-500 flex-shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-[150px] md:max-w-[200px]">{reservation.trajet.depart}</span>
              <span className="mx-2 flex-shrink-0">→</span>
              <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-[150px] md:max-w-[200px]">{reservation.trajet.destination}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FaCalendar className="flex-shrink-0" />
                <span className="truncate">{formatDate(reservation.trajet.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaUser className="flex-shrink-0" />
                <span className="truncate">{reservation.trajet.conducteur.nom}</span>
              </div>
              {voiture && (
                <div className="flex items-center gap-1">
                  <FaCar className="flex-shrink-0" />
                  <span className="truncate">{voiture.marque} {voiture.modele}</span>
                </div>
              )}
            </div>
          </div>

          {/* Statut et prix */}
          <div className="flex flex-col gap-2 w-full lg:w-auto lg:min-w-[150px]">
            <span className={`px-3 py-1 rounded-full text-sm font-medium text-center ${
              reservation.statut === 'CONFIRMEE' ? 'bg-green-100 text-green-800' :
              reservation.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {reservation.statut}
            </span>
            <span className="font-bold text-lg text-green-600 text-center">
              {reservation.trajet.prix * reservation.nbPlaces} €
            </span>
            <span className="text-sm text-gray-600 text-center">
              {reservation.nbPlaces} place(s)
            </span>
          </div>
        </div>
      </div>

      {/* Section évaluation */}
      {canEvaluate && (
        <div className="p-6 bg-gray-50">
          {evaluationActive ? (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Évaluer le conducteur</h4>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setLocalNote(star)}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= localNote ? (
                      <FaStarSolid className="text-yellow-400" />
                    ) : (
                      <FiStar className="text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
              <textarea
                value={localCommentaire}
                onChange={(e) => {
                  console.log('Textarea change:', e.target.value);
                  setLocalCommentaire(e.target.value);
                }}
                placeholder="Laissez un commentaire sur votre expérience..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                rows="3"
                required
                style={{ minHeight: '100px' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitEvaluation}
                  disabled={submitting || localNote === 0 || !localCommentaire.trim()}
                  className={`px-4 py-2 rounded-lg text-white font-medium ${
                    submitting || localNote === 0 || !localCommentaire.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {submitting ? 'Envoi...' : 'Envoyer l\'évaluation'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEvaluationActive(true)}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Évaluer le conducteur
            </button>
          )}
        </div>
      )}

      {/* Afficher l'avis si déjà donné */}
      {reservation.avis && (
        <div className="p-6 bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-3">Votre évaluation</h4>
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            {Array.from({ length: reservation.avis.note }).map((_, i) => (
              <FaStarSolid key={i} />
            ))}
          </div>
          <p className="text-gray-600">{reservation.avis.commentaire}</p>
          <p className="text-sm text-gray-500 mt-2">
            Donné le {new Date(reservation.avis.date).toLocaleDateString('fr-FR')}
          </p>
        </div>
      )}
    </div>
  );
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setError(null);
      const response = await fetch('http://localhost:5000/mes-reservations', {
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la récupération des réservations');
      }

      const data = await response.json();
      console.log("Réservations reçues:", data);
      setReservations(data);
    } catch (error) {
      console.error("Erreur:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleEvaluation = async (reservationId, conducteurId, note, commentaire) => {
    try {
      setSubmitting(true);
      const response = await fetch('http://localhost:5000/avis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          note,
          commentaire,
          conducteurId,
          reservationId
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'envoi de l\'avis');
      }

      // Rafraîchir les réservations pour mettre à jour l'affichage
      await fetchReservations();
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour séparer les réservations
  const separerReservations = (reservations) => {
    const maintenant = new Date();
    return {
      reservationsEnCours: reservations.filter(r => !r.trajet.effectue && new Date(r.trajet.date) >= maintenant),
      reservationsEffectuees: reservations.filter(r => r.trajet.effectue || new Date(r.trajet.date) < maintenant)
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { reservationsEnCours, reservationsEffectuees } = separerReservations(reservations);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mes Réservations</h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-600 mb-4">Vous n'avez pas encore de réservations.</p>
            <button
              onClick={() => router.push('/recherche')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Rechercher un trajet
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Colonne gauche : Réservations en cours et à venir */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-blue-600">
                  <FaMapMarkerAlt className="text-blue-500" />
                  Trajets à venir et en cours
                  <span className="ml-2 text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    {reservationsEnCours.length}
                  </span>
                </h2>
                {reservationsEnCours.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Aucune réservation en cours ou à venir
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reservationsEnCours.map(reservation => (
                      <ReservationCard 
                        key={reservation.id} 
                        reservation={reservation} 
                        onEvaluation={handleEvaluation}
                        submitting={submitting}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite : Réservations effectuées */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-green-600">
                  <FaCheckCircle className="text-green-500" />
                  Trajets effectués
                  <span className="ml-2 text-sm bg-green-100 text-green-600 px-2 py-1 rounded-full">
                    {reservationsEffectuees.length}
                  </span>
                </h2>
                {reservationsEffectuees.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Aucun trajet effectué
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reservationsEffectuees.map(reservation => (
                      <ReservationCard 
                        key={reservation.id} 
                        reservation={reservation} 
                        onEvaluation={handleEvaluation}
                        submitting={submitting}
                      />
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