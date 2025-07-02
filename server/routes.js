import { Router } from "express";
import { ajouterTrajet, listerTousLesTrajets, getTrajetById ,addVoiture ,getVoituresByUser,deleteVoiture} from "./model/todo.js";

const router = Router();

// Route POST pour ajouter un trajet
router.post("/trajets", async (req, res) => {
  try {
    console.log("Requête reçue :", req.body);
    const trajet = await ajouterTrajet(req.body);
    res.status(201).json(trajet);
  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(400).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Route GET pour récupérer tous les trajets
router.get("/trajets", async (req, res) => {
  try {
    const trajets = await listerTousLesTrajets();
    res.status(200).json(trajets);
  } catch (error) {
    console.error("Erreur route /trajets:", error.message);
    res.status(500).json({ error: "Impossible de récupérer les trajets." });
  }
});

// Route GET pour récupérer un trajet spécifique par ID
router.get("/trajets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const trajet = await getTrajetById(id);
    res.status(200).json(trajet);
  } catch (error) {
    console.error("Erreur route /trajets/:id:", error.message);
    res.status(500).json({ error: "Impossible de récupérer le trajet demandé." });
  }
});


//route pour ajouter une voiture 
router.post("/voiture", async (req, res) => {
  const { marque, modele, couleur, immatriculation, proprietaireId } = req.body;

  if (!marque || !modele || !couleur || !immatriculation || !proprietaireId) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  try {
    const voiture = await addVoiture({
      marque,
      modele,
      couleur,
      immatriculation,
      proprietaireId,
    });
    res.status(201).json(voiture);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur lors de l'ajout de la voiture" });
  }
});

//route pour recupere une voiture 
router.get("/voiture/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const voitures = await getVoituresByUser(userId);

    if (voitures.length === 0) {
      return res.status(404).json({ message: "Aucune voiture trouvée pour cet utilisateur." });
    }

    res.json(voitures);
  } catch (error) {
    console.error("Erreur lors de la récupération des voitures :", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des voitures" });
  }
});


// Exemple de route pour Express.js
router.delete('/voiture/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const voitureSupprimee = await deleteVoiture(id);
    res.json({ message: 'Voiture supprimée avec succès', voiture: voitureSupprimee });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la voiture', error });
  }
});

export default router;
