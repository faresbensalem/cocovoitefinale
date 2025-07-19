'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCar, FaTrash } from 'react-icons/fa';

export default function VoiturePage() {
  const [voiture, setVoiture] = useState({
    marque: '',
    modele: '',
    couleur: '',
    immatriculation: '',
  });
  const [voitures, setVoitures] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('http://localhost:5000/check-session', {
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error('Erreur de connexion au serveur');
        }

        const data = await res.json();
        
        if (data.isAuthenticated && data.user) {
          // setUser(data.user); // This line was removed from the new_code, so it's removed here.
          await loadVoitures(data.user.id);
        } else {
          router.push('/connexion');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('❌ ' + error.message); // Changed from setMessage to setError
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const loadVoitures = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/voiture/${userId}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Erreur lors du chargement des voitures');
      }

      const data = await res.json();
      setVoitures(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
      setError('❌ ' + error.message); // Changed from setMessage to setError
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVoiture(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setSuccess(false); // Clear previous success messages

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/voiture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(voiture)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'ajout de la voiture');
      }

      setVoitures([data, ...voitures]);
      setVoiture({ marque: '', modele: '', couleur: '', immatriculation: '' });
      setSuccess('✅ Voiture ajoutée avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      setError('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (voitureId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette voiture ?')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/voiture/${voitureId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors de la suppression');
      }

      setVoitures(voitures.filter(v => v.id !== voitureId));
      setSuccess('✅ Voiture supprimée avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      setError('❌ ' + error.message);
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
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FaCar className="text-blue-500" />
            Ajouter une voiture
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Marque
              </label>
              <input
                type="text"
                name="marque"
                value={voiture.marque}
                onChange={(e) => setVoiture({ ...voiture, marque: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Modèle
              </label>
              <input
                type="text"
                name="modele"
                value={voiture.modele}
                onChange={(e) => setVoiture({ ...voiture, modele: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Couleur
              </label>
              <input
                type="text"
                name="couleur"
                value={voiture.couleur}
                onChange={(e) => setVoiture({ ...voiture, couleur: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Immatriculation
              </label>
              <input
                type="text"
                name="immatriculation"
                value={voiture.immatriculation}
                onChange={(e) => setVoiture({ ...voiture, immatriculation: e.target.value })}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Ajout en cours...' : 'Ajouter la voiture'}
              </button>
            </div>
          </form>
        </div>

        {/* Liste des voitures */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Mes voitures</h2>
          
          {voitures.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Vous n'avez pas encore ajouté de voiture.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modèle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Couleur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Immatriculation
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {voitures.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {v.marque}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {v.modele}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {v.couleur}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {v.immatriculation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="text-red-600 hover:text-red-900 focus:outline-none"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
