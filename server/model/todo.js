import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fonction pour ajouter un trajet
export async function ajouterTrajet(data) {
  try {
    const { depart, adresseDepart, destination, adresseArrivee, date, places, prix, conducteurId, animauxAcceptes, bagagesAcceptes } = data;

    // Vérification des champs requis
    if (!depart || !adresseDepart || !destination || !adresseArrivee || !date || !places || !prix || !conducteurId) {
      throw new Error("Tous les champs sont requis.");
    }

    // Création du trajet dans la base de données
    const trajet = await prisma.trajet.create({
      data: {
        depart,
        adresseDepart,  // Nouvelle adresse de départ
        destination,
        adresseArrivee, // Nouvelle adresse d'arrivée
        date: new Date(date),
        places: parseInt(places),
        prix: parseFloat(prix),
        animauxAcceptes: animauxAcceptes ?? false, // Si non défini, valeur par défaut
        bagagesAcceptes: bagagesAcceptes ?? true,   // Si non défini, valeur par défaut
        conducteur: {
          connect: { id: conducteurId }
        }
      }
    });

    return trajet;
  } catch (err) {
    console.error("Erreur dans ajouterTrajet:", err);
    throw new Error(`Création du trajet échouée : ${err.message}`);
  }
}

// Fonction pour récupérer tous les trajets
export async function listerTousLesTrajets() {
  try {
    const trajets = await prisma.trajet.findMany({
      include: {
        conducteur: {
          select: {
            id: true,
            nom: true,
            email: true
          }
        },
        reservations: {
          include: {
            passager: {
              select: {
                id: true,
                nom: true,
                email: true
              }
            }
          }
        }
      }
    });
    return trajets;
  } catch (err) {
    console.error("Erreur Prisma :", err);
    throw new Error("Erreur de base de données");
  }
}

// Fonction pour récupérer un trajet par ID
export async function getTrajetById(id) {
  try {
    const trajet = await prisma.trajet.findUnique({
      where: { id },
      include: {
        conducteur: true,
        reservations: {
          include: {
            passager: true
          }
        }
      }
    });

    if (!trajet) {
      throw new Error("Trajet non trouvé");
    }

    return trajet;
  } catch (err) {
    console.error("Erreur dans getTrajetById:", err);
    throw new Error("Impossible de récupérer le trajet.");
  }
}


/**
 * Ajoute une voiture pour un utilisateur
 * @param {Object} data
 * @param {string} data.marque
 * @param {string} data.modele
 * @param {string} data.couleur
 * @param {string} data.immatriculation
 * @param {string} data.proprietaireId
 * @returns {Promise<Object>}
 */
export async function addVoiture(data) {
  try {
    const voiture = await prisma.voiture.create({
      data: {
        marque: data.marque,
        modele: data.modele,
        couleur: data.couleur,
        immatriculation: data.immatriculation,
        proprietaire: {
          connect: { id: data.proprietaireId },
        },
      },
    });
    return voiture;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la voiture :", error);
    throw error;
  }
}
/**
 * Récupère toutes les voitures d’un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>}
 */
export async function getVoituresByUser(userId) {
  try {
    const voitures = await prisma.voiture.findMany({
      where: {
        proprietaireId: userId,
      },
      orderBy: {
        creeLe: "desc",
      },
    });
    return voitures;
  } catch (error) {
    console.error("Erreur lors de la récupération des voitures :", error);
    throw error;
  }
}
/**
 * Supprime une voiture par son ID
 * @param {string} voitureId - ID de la voiture à supprimer
 * @returns {Promise<Object>} - La voiture supprimée
 */
export async function deleteVoiture(voitureId) {
  try {
    const voiture = await prisma.voiture.delete({
      where: {
        id: voitureId,
      },
    });
    return voiture;
  } catch (error) {
    console.error("Erreur lors de la suppression de la voiture :", error);
    throw error;
  }
}
