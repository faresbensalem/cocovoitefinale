'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaMapMarkerAlt, FaCalendar, FaUser, FaCar, FaStar as FaStarSolid } from 'react-icons/fa';
import { FiStar } from 'react-icons/fi';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluationActive, setEvaluationActive] = useState(null);
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleEvaluation = async (reservationId, conducteurId) => {
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
      setEvaluationActive(null);
      setNote(0);
      setCommentaire('');
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mes Réservations</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">Vous n'avez pas encore de réservations.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reservations.map((reservation) => {
              const voiture = reservation.trajet.conducteur.voitures[0];
              return (
                <div key={reservation.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Informations principales */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 text-lg font-medium">
                        <FaMapMarkerAlt className="text-green-500" />
                        {reservation.trajet.depart} 
                        <span className="mx-2">→</span>
                        <FaMapMarkerAlt className="text-red-500" />
                        {reservation.trajet.destination}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <FaCalendar className="text-blue-500" />
                        {formatDate(reservation.trajet.date)}
                      </div>
                    </div>

                    {/* Conducteur et voiture */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaUser className="text-blue-500" />
                        {reservation.trajet.conducteur.nom}
                      </div>
                      {voiture && (
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <FaCar className="text-blue-500" />
                          {voiture.marque} {voiture.modele} - {voiture.couleur}
                        </div>
                      )}
                    </div>

                    {/* Prix et statut */}
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        reservation.statut === 'CONFIRMEE' ? 'bg-green-100 text-green-800' :
                        reservation.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {reservation.statut}
                      </span>
                      <span className="font-bold text-lg text-green-600">
                        {reservation.trajet.prix * reservation.nbPlaces} €
                      </span>
                    </div>
                  </div>

                  {/* Section évaluation */}
                  {reservation.statut === 'CONFIRMEE' && reservation.trajet.effectue === true && !reservation.avis && (
                    <div className="mt-4 pt-4 border-t">
                      {evaluationActive === reservation.id ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setNote(star)}
                                className="text-2xl focus:outline-none"
                              >
                                {star <= note ? (
                                  <FaStarSolid className="text-yellow-400" />
                                ) : (
                                  <FiStar className="text-gray-400" />
                                )}
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={commentaire}
                            onChange={(e) => setCommentaire(e.target.value)}
                            placeholder="Laissez un commentaire sur votre expérience..."
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            rows="3"
                            required
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEvaluation(reservation.id, reservation.trajet.conducteur.id)}
                              disabled={submitting || note === 0 || !commentaire.trim()}
                              className={`px-4 py-2 rounded-lg text-white ${
                                submitting || note === 0 || !commentaire.trim()
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-blue-500 hover:bg-blue-600'
                              }`}
                            >
                              {submitting ? 'Envoi...' : 'Envoyer l\'évaluation'}
                            </button>
                            <button
                              onClick={() => {
                                setEvaluationActive(null);
                                setNote(0);
                                setCommentaire('');
                              }}
                              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEvaluationActive(reservation.id)}
                          className="text-blue-500 hover:text-blue-700 font-medium"
                        >
                          Évaluer le conducteur
                        </button>
                      )}
                    </div>
                  )}

                  {/* Afficher l'avis si déjà donné */}
                  {reservation.avis && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-yellow-400">
                        {Array.from({ length: reservation.avis.note }).map((_, i) => (
                          <FaStarSolid key={i} />
                        ))}
                      </div>
                      <p className="text-gray-600 mt-2">{reservation.avis.commentaire}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Donné le {new Date(reservation.avis.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 