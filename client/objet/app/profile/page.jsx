'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaCar, FaMapMarkedAlt, FaBookmark, FaCalendarAlt, FaStar, FaCommentDots } from 'react-icons/fa';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    trajets: [],
    reservations: [],
    voitures: []
  });
  const [loading, setLoading] = useState(true);
  const [avis, setAvis] = useState({ avis: [], moyenne: 0, total: 0 });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Vérifier l'authentification
        const authResponse = await fetch('http://localhost:5000/check-session', {
          credentials: 'include'
        });
        const authData = await authResponse.json();

        if (!authData.isAuthenticated) {
          router.push('/connexion');
          return;
        }

        console.log("Données utilisateur reçues:", authData.user); // Debug
        setUser(authData.user);

        // Charger les trajets
        const trajetsResponse = await fetch('http://localhost:5000/mes-trajets', {
          credentials: 'include'
        });
        const trajetsData = await trajetsResponse.json();

        // Charger les réservations
        const reservationsResponse = await fetch('http://localhost:5000/mes-reservations', {
          credentials: 'include'
        });
        const reservationsData = await reservationsResponse.json();

        setStats({
          trajets: trajetsData,
          reservations: reservationsData,
          voitures: authData.user.voitures || [] // Utiliser les voitures de l'utilisateur
        });

        // Charger les avis reçus (note et commentaires)
        if (authData.user && authData.user.id) {
          const avisResponse = await fetch(`http://localhost:5000/avis/conducteur/${authData.user.id}`);
          if (avisResponse.ok) {
            const avisData = await avisResponse.json();
            setAvis(avisData);
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Section Profil */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center">
                <FaUser className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">{user.nom || 'Utilisateur'}</h2>
            <p className="text-gray-500 text-center mb-6">{user.type || 'Utilisateur standard'}</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-blue-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaPhone className="text-blue-500" />
                <span>{user.numero || 'Non spécifié'}</span>
              </div>
              <div className="flex items-center gap-3">
                <FaBirthdayCake className="text-blue-500" />
                <span>{formatDate(user.dateNaissance)}</span>
              </div>
            </div>

            {/* Section Voiture */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaCar className="text-blue-500" />
                Ma voiture
              </h3>
              {user.voitures && user.voitures.length > 0 ? (
                user.voitures.map((voiture) => (
                  <div key={voiture.id} className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{voiture.marque} {voiture.modele}</p>
                    <p className="text-gray-600">Couleur: {voiture.couleur}</p>
                    <p className="text-gray-600">Immatriculation: {voiture.immatriculation}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">Vous n'avez pas encore ajouté de voiture</p>
                  <button
                    onClick={() => router.push('/voiture')}
                    className="text-blue-500 hover:text-blue-700 font-medium"
                  >
                    Ajouter une voiture
                  </button>
                </div>
              )}
            </div>

            {/* Section Note et Commentaires */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaStar className="text-yellow-400" />
                Note & Commentaires
              </h3>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-yellow-500">{avis.moyenne}</span>
                <FaStar className="text-yellow-400" />
                <span className="text-gray-600">({avis.total} avis)</span>
              </div>
              {avis.avis.length > 0 ? (
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {avis.avis.map((a) => (
                    <div key={a.id} className="bg-gray-50 rounded-lg p-3 border">
                      <div className="flex items-center gap-2 mb-1">
                        <FaStar className="text-yellow-400" />
                        <span className="font-semibold">{a.note}/5</span>
                        <span className="text-xs text-gray-400 ml-auto">{new Date(a.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <FaCommentDots className="text-blue-400" />
                        <span className="text-gray-700">{a.commentaire}</span>
                      </div>
                      <div className="text-xs text-gray-500">par {a.auteur?.nom || 'Utilisateur'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">Aucun avis pour le moment.</div>
              )}
            </div>
          </div>
        </div>

        {/* Section Statistiques et autres sections restent inchangées */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-500 text-white rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Trajets publiés</p>
                  <h3 className="text-2xl font-bold">{stats.trajets.length}</h3>
                </div>
                <FaMapMarkedAlt className="text-3xl opacity-80" />
              </div>
            </div>

            <div className="bg-green-500 text-white rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Réservations</p>
                  <h3 className="text-2xl font-bold">{stats.reservations.length}</h3>
                </div>
                <FaBookmark className="text-3xl opacity-80" />
              </div>
            </div>

            <div className="bg-purple-500 text-white rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Véhicules</p>
                  <h3 className="text-2xl font-bold">{stats.voitures.length}</h3>
                </div>
                <FaCar className="text-3xl opacity-80" />
              </div>
            </div>
          </div>

          {/* Sections Trajets et Réservations restent inchangées */}
          {/* Section Derniers trajets */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaMapMarkedAlt className="text-blue-500" />
              Derniers trajets publiés
            </h3>
            <div className="space-y-4">
              {stats.trajets.slice(0, 3).map((trajet) => (
                <div key={trajet.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{trajet.depart} → {trajet.destination}</p>
                      <p className="text-sm text-gray-500">
                        <FaCalendarAlt className="inline mr-2" />
                        {formatDate(trajet.date)}
                      </p>
                    </div>
                    <span className="text-green-600 font-bold">{trajet.prix}€</span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => router.push('/mestrajet')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors mt-4"
              >
                Voir tous mes trajets
              </button>
            </div>
          </div>

          {/* Section Dernières réservations */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaBookmark className="text-green-500" />
              Dernières réservations
            </h3>
            <div className="space-y-4">
              {stats.reservations.slice(0, 3).map((reservation) => (
                <div key={reservation.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {reservation.trajet.depart} → {reservation.trajet.destination}
                      </p>
                      <p className="text-sm text-gray-500">
                        <FaCalendarAlt className="inline mr-2" />
                        {formatDate(reservation.trajet.date)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
                      reservation.statut === 'CONFIRMEE' ? 'bg-green-100 text-green-800' :
                      reservation.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {reservation.statut}
                    </span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => router.push('/reservations')}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors mt-4"
              >
                Voir toutes mes réservations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 