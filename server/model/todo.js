import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fonction pour ajouter un trajet
async function ajouterTrajet(trajetData) {
  try {
    // Vérifier si l'utilisateur existe
    const conducteur = await prisma.user.findUnique({
      where: { id: trajetData.conducteurId }
    });

    if (!conducteur) {
      throw new Error("Conducteur non trouvé");
    }

    // Vérifier que le nombre de places est positif
    if (trajetData.places <= 0) {
      throw new Error("Le nombre de places doit être positif");
    }

    // Vérifier que le prix est positif
    if (trajetData.prix < 0) {
      throw new Error("Le prix ne peut pas être négatif");
    }

    // Vérifier que la date est dans le futur
    const dateTrajet = new Date(trajetData.date);
    if (dateTrajet < new Date()) {
      throw new Error("La date du trajet doit être dans le futur");
    }

    // Créer le trajet
    const trajet = await prisma.trajet.create({
      data: {
        depart: trajetData.depart,
        adresseDepart: trajetData.adresseDepart,
        destination: trajetData.destination,
        adresseArrivee: trajetData.adresseArrivee,
        date: dateTrajet,
        places: trajetData.places,
        prix: trajetData.prix,
        animauxAcceptes: trajetData.animauxAcceptes || false,
        bagagesAcceptes: trajetData.bagagesAcceptes || true,
        conducteurId: trajetData.conducteurId
      },
      include: {
        conducteur: {
          select: {
            id: true,
            nom: true,
            email: true
          }
        }
      }
    });

    return trajet;
  } catch (error) {
    console.error("Erreur dans ajouterTrajet:", error);
    throw error;
  }
}

// Fonction pour lister tous les trajets
async function listerTousLesTrajets() {
  try {
    console.log("Récupération de tous les trajets...");
    const trajets = await prisma.trajet.findMany({
      include: {
        conducteur: {
          select: {
            id: true,
            nom: true,
            email: true
          }
        },
        reservations: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log(`Nombre de trajets trouvés: ${trajets.length}`);
    return trajets;
  } catch (error) {
    console.error("Erreur dans listerTousLesTrajets:", error);
    throw error;
  }
}

// Fonction pour récupérer un trajet par ID
async function getTrajetById(id) {
  try {
    const trajet = await prisma.trajet.findUnique({
      where: { id },
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

    if (!trajet) {
      throw new Error("Trajet non trouvé");
    }

    return trajet;
  } catch (error) {
    console.error("Erreur dans getTrajetById:", error);
    throw error;
  }
}

// Fonction pour supprimer un trajet
async function supprimerTrajet(id, userId) {
  try {
    // Vérifier si le trajet existe et appartient à l'utilisateur
    const trajet = await prisma.trajet.findFirst({
      where: {
        id,
        conducteurId: userId
      }
    });

    if (!trajet) {
      throw new Error("Trajet non trouvé ou vous n'êtes pas autorisé à le supprimer");
    }

    // Vérifier s'il y a des réservations
    const reservations = await prisma.reservation.findMany({
      where: { trajetId: id }
    });

    if (reservations.length > 0) {
      throw new Error("Impossible de supprimer un trajet qui a des réservations");
    }

    // Supprimer le trajet
    await prisma.trajet.delete({
      where: { id }
    });

    return { message: "Trajet supprimé avec succès" };
  } catch (error) {
    console.error("Erreur dans supprimerTrajet:", error);
    throw error;
  }
}

// Fonction pour récupérer les trajets d'un conducteur
async function getTrajetsByConducteur(conducteurId) {
  try {
    const trajets = await prisma.trajet.findMany({
      where: { conducteurId },
      include: {
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
      },
      orderBy: {
        date: 'desc'
      }
    });

    return trajets;
  } catch (error) {
    console.error("Erreur dans getTrajetsByConducteur:", error);
    throw error;
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
 * Récupère toutes les voitures d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>}
 */
export async function getVoituresByUser(userId) {
  try {
    console.log("Recherche des voitures pour l'utilisateur:", userId);
    const voitures = await prisma.voiture.findMany({
      where: {
        proprietaireId: userId,
      },
      orderBy: {
        modifLe: "desc",
      },
    });
    console.log("Voitures trouvées:", voitures);
    return voitures;
  } catch (error) {
    console.error("Erreur lors de la récupération des voitures :", error);
    throw new Error("Erreur lors de la récupération des voitures");
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




// Fonction pour ajouter une réservation avec paiement
async function ajouterReservationAvecPaiement(data) {
  const { trajetId, passagerId, nbPlaces, montant } = data;

  if (!trajetId || !passagerId || !nbPlaces || !montant) {
    throw new Error("Champs requis manquants.");
  }

  return await prisma.$transaction(async (tx) => {
    // Créer la réservation
    const reservation = await tx.reservation.create({
      data: {
        trajetId,
        passagerId,
        nbPlaces: parseInt(nbPlaces),
        statut: "CONFIRMEE",
      },
    });

    // Créer le paiement fake
    const paiement = await tx.paiement.create({
      data: {
        utilisateurId: passagerId,
        reservationId: reservation.id,
        montant: parseFloat(montant),
        statut: "REUSSI",
        fournisseur: "FakePay",
        transactionRef: `fake-${Date.now()}`
      },
    });

    return { reservation, paiement };
  });
}

// Fonction pour récupérer les réservations d'un utilisateur
async function getReservationsByUser(userId) {
  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        passagerId: userId
      },
      include: {
        trajet: {
          include: {
            conducteur: {
              select: {
                id: true,
                nom: true,
                email: true,
                numero: true
              }
            }
          }
        },
        paiement: true
      },
      orderBy: {
        creeLe: 'desc'
      }
    });

    return reservations;
  } catch (error) {
    console.error("Erreur dans getReservationsByUser:", error);
    throw error;
  }
}

// Fonction pour créer une réservation
async function creerReservation(data) {
  try {
    // Vérifier si le trajet existe
    const trajet = await prisma.trajet.findUnique({
      where: { id: data.trajetId },
      include: {
        reservations: true
      }
    });

    if (!trajet) {
      throw new Error("Trajet non trouvé");
    }

    // Vérifier si l'utilisateur n'est pas le conducteur
    if (trajet.conducteurId === data.passagerId) {
      throw new Error("Vous ne pouvez pas réserver votre propre trajet");
    }

    // Vérifier si l'utilisateur n'a pas déjà réservé ce trajet
    const reservationExistante = await prisma.reservation.findFirst({
      where: {
        trajetId: data.trajetId,
        passagerId: data.passagerId
      }
    });

    if (reservationExistante) {
      throw new Error("Vous avez déjà réservé ce trajet");
    }

    // Calculer le nombre total de places réservées
    const placesReservees = trajet.reservations.reduce((total, res) => total + res.nbPlaces, 0);
    const placesRestantes = trajet.places - placesReservees;

    // Vérifier s'il y a assez de places
    if (data.nbPlaces > placesRestantes) {
      throw new Error(`Il ne reste que ${placesRestantes} place(s) disponible(s)`);
    }

    // Créer la réservation
    const reservation = await prisma.reservation.create({
      data: {
        trajetId: data.trajetId,
        passagerId: data.passagerId,
        nbPlaces: data.nbPlaces,
        statut: "EN_ATTENTE"
      },
      include: {
        trajet: {
          include: {
            conducteur: {
              select: {
                id: true,
                nom: true,
                email: true,
                numero: true
              }
            }
          }
        }
      }
    });

    return reservation;
  } catch (error) {
    console.error("Erreur dans creerReservation:", error);
    throw error;
  }
}

// Fonction pour mettre à jour le statut d'une réservation
async function updateReservationStatus(reservationId, userId, nouveauStatut) {
  try {
    // Vérifier si la réservation existe et appartient à l'utilisateur
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        OR: [
          { passagerId: userId },
          { trajet: { conducteurId: userId } }
        ]
      },
      include: {
        trajet: true
      }
    });

    if (!reservation) {
      throw new Error("Réservation non trouvée ou accès non autorisé");
    }

    // Mettre à jour le statut
    const reservationMiseAJour = await prisma.reservation.update({
      where: { id: reservationId },
      data: { statut: nouveauStatut },
      include: {
        trajet: {
          include: {
            conducteur: {
              select: {
                id: true,
                nom: true,
                email: true,
                numero: true
              }
            }
          }
        },
        passager: {
          select: {
            id: true,
            nom: true,
            email: true,
            numero: true
          }
        }
      }
    });

    return reservationMiseAJour;
  } catch (error) {
    console.error("Erreur dans updateReservationStatus:", error);
    throw error;
  }
}

// Fonction pour ajouter une voiture
async function ajouterVoiture(voitureData) {
  try {
    // Vérifier si l'immatriculation existe déjà
    const voitureExistante = await prisma.voiture.findUnique({
      where: {
        immatriculation: voitureData.immatriculation
      }
    });

    if (voitureExistante) {
      throw new Error("Une voiture avec cette immatriculation existe déjà");
    }

    // Vérifier si l'utilisateur existe
    const utilisateur = await prisma.user.findUnique({
      where: {
        id: voitureData.proprietaireId
      }
    });

    if (!utilisateur) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier si l'utilisateur a déjà une voiture
    const voituresUtilisateur = await prisma.voiture.findMany({
      where: {
        proprietaireId: voitureData.proprietaireId
      }
    });

    if (voituresUtilisateur.length >= 1) {
      throw new Error("Vous ne pouvez avoir qu'une seule voiture");
    }

    // Créer la voiture
    const nouvelleVoiture = await prisma.voiture.create({
      data: {
        marque: voitureData.marque,
        modele: voitureData.modele,
        couleur: voitureData.couleur,
        immatriculation: voitureData.immatriculation,
        proprietaireId: voitureData.proprietaireId
      }
    });

    return nouvelleVoiture;
  } catch (error) {
    console.error("Erreur dans ajouterVoiture:", error);
    throw error;
  }
}

// Fonction pour récupérer les voitures d'un utilisateur
async function getVoituresUtilisateur(userId) {
  try {
    const voitures = await prisma.voiture.findMany({
      where: {
        proprietaireId: userId
      },
      orderBy: {
        creeLe: 'desc'
      }
    });
    return voitures;
  } catch (error) {
    console.error("Erreur dans getVoituresUtilisateur:", error);
    throw error;
  }
}

// Fonction pour supprimer une voiture
async function supprimerVoiture(voitureId, userId) {
  try {
    // Vérifier si la voiture existe et appartient à l'utilisateur
    const voiture = await prisma.voiture.findFirst({
      where: {
        id: voitureId,
        proprietaireId: userId
      }
    });

    if (!voiture) {
      throw new Error("Voiture non trouvée ou vous n'avez pas les droits pour la supprimer");
    }

    await prisma.voiture.delete({
      where: {
        id: voitureId
      }
    });

    return { message: "Voiture supprimée avec succès" };
  } catch (error) {
    console.error("Erreur dans supprimerVoiture:", error);
    throw error;
  }
}

export {
  ajouterTrajet,
  listerTousLesTrajets,
  getTrajetById,
  supprimerTrajet,
  getTrajetsByConducteur,
  getReservationsByUser,
  creerReservation,
  updateReservationStatus,
  ajouterVoiture,
  getVoituresUtilisateur,
  supprimerVoiture,
  ajouterReservationAvecPaiement
};
