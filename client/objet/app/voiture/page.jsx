"use client";
import { useEffect, useState } from "react";
import { FaCar, FaPaintBrush, FaTag, FaRegIdCard } from "react-icons/fa"; // Import des icônes

export default function MesTrajets() {
  const userId = "1"; // Remplace par l'ID de l'utilisateur ou récupère-le dynamiquement

  const [voitures, setVoitures] = useState([]);
  const [formData, setFormData] = useState({
    marque: "",
    modele: "",
    couleur: "",
    immatriculation: "",
  });
  const [message, setMessage] = useState("");

  // Récupérer les voitures du conducteur
  useEffect(() => {
    fetch(`http://localhost:5000/voiture/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVoitures(data);
        } else {
          console.error("Réponse inattendue : ", data);
          setVoitures([]);
        }
      })
      .catch((err) => {
        console.error("Erreur de récupération des voitures :", err);
        setVoitures([]);
      });
  }, [userId]);

  // Gérer l'ajout de voiture
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (voitures.length >= 1) {
      setMessage("❌ Vous ne pouvez ajouter qu'une seule voiture. Supprimez-en une pour en ajouter une nouvelle.");
      return;
    }

    const payload = {
      ...formData,
      proprietaireId: userId,
    };

    try {
      const res = await fetch("http://localhost:5000/voiture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur lors de l'ajout");

      const nouvelleVoiture = await res.json();
      setVoitures([nouvelleVoiture, ...voitures]);
      setFormData({ marque: "", modele: "", couleur: "", immatriculation: "" });
      setMessage("🚗 Voiture ajoutée avec succès !");
    } catch (err) {
      console.error("Erreur lors de l'ajout de la voiture :", err);
      setMessage("❌ Erreur lors de l'ajout de la voiture.");
    }
  };

  // Gérer la suppression de la voiture
  const handleDelete = async (voitureId) => {
    try {
      const res = await fetch(`http://localhost:5000/voiture/${voitureId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      setVoitures(voitures.filter((voiture) => voiture.id !== voitureId));
      setMessage("🚗 Voiture supprimée avec succès !");
    } catch (err) {
      console.error("Erreur lors de la suppression de la voiture :", err);
      setMessage("❌ Erreur lors de la suppression de la voiture.");
    }
  };

  return (
    <div className="flex gap-8 p-8 bg-gray-50">
      {/* Formulaire d'ajout */}
      <div className="w-1/2 p-6 rounded-xl shadow-lg bg-white border border-gray-200 space-y-4">
        <h2 className="text-3xl font-semibold mb-6 text-blue-600">Ajouter une voiture</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              name="marque"
              placeholder="Marque"
              value={formData.marque}
              onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg pl-10"
              required
            />
            <FaCar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          <div className="relative">
            <input
              type="text"
              name="modele"
              placeholder="Modèle"
              value={formData.modele}
              onChange={(e) => setFormData({ ...formData, modele: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg pl-10"
              required
            />
            <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          <div className="relative">
            <input
              type="text"
              name="couleur"
              placeholder="Couleur"
              value={formData.couleur}
              onChange={(e) => setFormData({ ...formData, couleur: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg pl-10"
              required
            />
            <FaPaintBrush className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          <div className="relative">
            <input
              type="text"
              name="immatriculation"
              placeholder="Immatriculation"
              value={formData.immatriculation}
              onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg pl-10"
              required
            />
            <FaRegIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg w-full"
          >
            Ajouter
          </button>
          {message && <p className="text-sm mt-2 text-gray-700">{message}</p>}
        </form>
      </div>

      {/* Liste des voitures sous forme de tableau */}
      <div className="w-1/2 p-6 rounded-xl shadow-lg bg-white border border-gray-200">
        <h2 className="text-3xl font-semibold mb-6 text-blue-600">Mes voitures</h2>
        {voitures.length === 0 ? (
          <p className="text-gray-600">Aucune voiture trouvée.</p>
        ) : (
          <table className="min-w-full bg-white table-auto border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-6 py-4 text-left">Marque</th>
                <th className="px-6 py-4 text-left">Modèle</th>
                <th className="px-6 py-4 text-left">Couleur</th>
                <th className="px-6 py-4 text-left">Immatriculation</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {voitures.map((voiture) => (
                <tr
                  key={voiture.id}
                  className="hover:bg-gray-100 border-b border-gray-200"
                >
                  <td className="px-6 py-4">{voiture.marque}</td>
                  <td className="px-6 py-4">{voiture.modele}</td>
                  <td className="px-6 py-4">{voiture.couleur}</td>
                  <td className="px-6 py-4">{voiture.immatriculation}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(voiture.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
