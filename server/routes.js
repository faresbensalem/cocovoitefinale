import { Router } from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import {
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
  supprimerVoiture
} from "./model/todo.js";

const router = Router();
const prisma = new PrismaClient();

// Middleware d'authentification
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Non authentifié" });
};

// Middleware pour vérifier l'admin
function requireAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.type === "ADMIN") {
    return next();
  }
  res.status(403).json({ error: "Accès réservé aux administrateurs." });
}

// Route d'inscription
router.post("/register", async (req, res) => {
  try {
    const { email, motDePasse, nom, numero, dateNaissance } = req.body;

    // Vérification si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        motDePasse: hashedPassword,
        nom,
        numero,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : null
      }
    });

    res.status(201).json({
      message: "Inscription réussie",
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
});

// Route de connexion
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ error: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      res.json({
        message: "Connexion réussie",
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom
        }
      });
    });
  })(req, res, next);
});

// Route de déconnexion
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Erreur lors de la déconnexion" });
    }
    res.json({ message: "Déconnexion réussie" });
  });
});

// Route de vérification de session
router.get("/check-session", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      // Récupérer l'utilisateur avec ses voitures
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          voitures: true
        }
      });
      
      res.json({
        isAuthenticated: true,
        user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          numero: user.numero,
          dateNaissance: user.dateNaissance,
          type: user.type,
          voitures: user.voitures,
          banni: user.banni
        }
      });
    } else {
      res.json({ isAuthenticated: false });
    }
  } catch (error) {
    console.error("Erreur check-session:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Routes pour les voitures
router.post("/voiture", isAuthenticated, async (req, res) => {
  try {
    const { marque, modele, couleur, immatriculation } = req.body;

    // Vérification des champs requis
    if (!marque || !modele || !couleur || !immatriculation) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }

    // Vérification si l'immatriculation existe déjà
    const existingVoiture = await prisma.voiture.findUnique({
      where: { immatriculation }
    });

    if (existingVoiture) {
      return res.status(400).json({ error: "Cette immatriculation est déjà utilisée" });
    }

    // Vérification si l'utilisateur a déjà une voiture
    const userVoitures = await prisma.voiture.findMany({
      where: { proprietaireId: req.user.id }
    });

    if (userVoitures.length >= 1) {
      return res.status(400).json({ error: "Vous ne pouvez avoir qu'une seule voiture" });
    }

    // Création de la voiture
    const voiture = await prisma.voiture.create({
      data: {
        marque,
        modele,
        couleur,
        immatriculation,
        proprietaireId: req.user.id
      }
    });

    res.status(201).json(voiture);
  } catch (error) {
    console.error("Erreur lors de l'ajout de la voiture:", error);
    res.status(500).json({ error: "Erreur lors de l'ajout de la voiture" });
  }
});

// Route pour récupérer les voitures d'un utilisateur
router.get("/voiture/:userId", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Accès non autorisé" });
    }

    const voitures = await prisma.voiture.findMany({
      where: { proprietaireId: userId },
      orderBy: { creeLe: "desc" }
    });

    res.json(voitures);
  } catch (error) {
    console.error("Erreur lors de la récupération des voitures:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des voitures" });
  }
});

// Route pour supprimer une voiture
router.delete("/voiture/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérification si la voiture existe et appartient à l'utilisateur
    const voiture = await prisma.voiture.findFirst({
      where: {
        id,
        proprietaireId: req.user.id
      }
    });

    if (!voiture) {
      return res.status(404).json({ error: "Voiture non trouvée ou accès non autorisé" });
    }

    await prisma.voiture.delete({
      where: { id }
    });

    res.json({ message: "Voiture supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la voiture:", error);
    res.status(500).json({ error: "Erreur lors de la suppression de la voiture" });
  }
});

// Routes pour les trajets
router.post("/trajets", isAuthenticated, async (req, res) => {
  try {
    const trajetData = {
      ...req.body,
      conducteurId: req.user.id
    };

    // Validation des données
    if (!trajetData.depart || !trajetData.adresseDepart || 
        !trajetData.destination || !trajetData.adresseArrivee || 
        !trajetData.date || !trajetData.places || !trajetData.prix) {
      return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis" });
    }

    const trajet = await prisma.trajet.create({
      data: {
        depart: trajetData.depart,
        adresseDepart: trajetData.adresseDepart,
        destination: trajetData.destination,
        adresseArrivee: trajetData.adresseArrivee,
        date: new Date(trajetData.date),
        places: parseInt(trajetData.places),
        prix: parseFloat(trajetData.prix),
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

    res.status(201).json(trajet);
  } catch (error) {
    console.error("Erreur lors de la création du trajet:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer tous les trajets
router.get("/trajets", async (req, res) => {
  try {
    console.log("Requête GET /trajets reçue");
    
    // Récupérer tous les trajets sans filtre
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

    console.log(`Nombre total de trajets trouvés: ${trajets.length}`);
    console.log("Trajets:", trajets);

    res.json(trajets);
  } catch (error) {
    console.error("Erreur lors de la récupération des trajets:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des trajets" });
  }
});

// Route pour récupérer un trajet spécifique
router.get("/trajets/:id", async (req, res) => {
  try {
    const { id } = req.params;
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
      return res.status(404).json({ error: "Trajet non trouvé" });
    }

    res.json(trajet);
  } catch (error) {
    console.error("Erreur lors de la récupération du trajet:", error);
    res.status(500).json({ error: "Erreur lors de la récupération du trajet" });
  }
});

// Route pour supprimer un trajet
router.delete("/trajets/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le trajet existe et appartient à l'utilisateur
    const trajet = await prisma.trajet.findFirst({
      where: {
        id,
        conducteurId: req.user.id
      }
    });

    if (!trajet) {
      return res.status(404).json({ error: "Trajet non trouvé ou vous n'êtes pas autorisé à le supprimer" });
    }

    // Vérifier s'il y a des réservations
    const reservations = await prisma.reservation.findMany({
      where: { trajetId: id }
    });

    if (reservations.length > 0) {
      return res.status(400).json({ error: "Impossible de supprimer un trajet qui a des réservations" });
    }

    await prisma.trajet.delete({
      where: { id }
    });

    res.json({ message: "Trajet supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du trajet:", error);
    res.status(500).json({ error: "Erreur lors de la suppression du trajet" });
  }
});

// Route pour récupérer les trajets d'un conducteur
router.get("/mes-trajets", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    console.log("Récupération des trajets pour l'utilisateur:", req.user.id);

    const trajets = await prisma.trajet.findMany({
      where: {
        conducteurId: req.user.id
      },
      include: {
        reservations: {
          include: {
            passager: {
              select: {
                id: true,
                nom: true,
                email: true,
                numero: true,
                dateNaissance: true
              }
            }
          }
        },
        conducteur: {
          select: {
            id: true,
            nom: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log(`Nombre de trajets trouvés: ${trajets.length}`);
    res.json(trajets);
  } catch (error) {
    console.error("Erreur lors de la récupération des trajets:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des trajets" });
  }
});

// Route pour récupérer les réservations d'un utilisateur
router.get("/mes-reservations", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    console.log("Récupération des réservations pour l'utilisateur:", req.user.id);

    const reservations = await prisma.reservation.findMany({
      where: {
        passagerId: req.user.id
      },
      include: {
        trajet: {
          include: {
            conducteur: {
              select: {
                id: true,
                nom: true,
                email: true,
                voitures: true
              }
            }
          }
        },
        avis: {
          select: {
            id: true,
            note: true,
            commentaire: true,
            date: true
          }
        }
      },
      orderBy: {
        creeLe: 'desc'
      }
    });

    console.log(`Nombre de réservations trouvées: ${reservations.length}`);
    res.json(reservations);
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des réservations" });
  }
});

// Route pour créer une réservation
router.post("/reservations", isAuthenticated, async (req, res) => {
  try {
    const { trajetId, nbPlaces } = req.body;

    if (!trajetId || !nbPlaces) {
      return res.status(400).json({ error: "Trajet et nombre de places requis" });
    }

    const reservation = await creerReservation({
      trajetId,
      passagerId: req.user.id,
      nbPlaces: parseInt(nbPlaces)
    });

    res.status(201).json(reservation);
  } catch (error) {
    console.error("Erreur lors de la création de la réservation:", error);
    res.status(400).json({ error: error.message });
  }
});

// Route pour mettre à jour le statut d'une réservation
router.patch("/reservations/:id/statut", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    if (!statut || !["EN_ATTENTE", "CONFIRMEE", "ANNULEE"].includes(statut)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const reservation = await updateReservationStatus(id, req.user.id, statut);
    res.json(reservation);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    res.status(400).json({ error: error.message });
  }
});

// Route pour récupérer une réservation spécifique
router.get("/reservations/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.findFirst({
      where: {
        id,
        OR: [
          { passagerId: req.user.id },
          { trajet: { conducteurId: req.user.id } }
        ]
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
        passager: {
          select: {
            id: true,
            nom: true,
            email: true,
            numero: true
          }
        },
        paiement: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée ou accès non autorisé" });
    }

    res.json(reservation);
  } catch (error) {
    console.error("Erreur lors de la récupération de la réservation:", error);
    res.status(500).json({ error: "Erreur lors de la récupération de la réservation" });
  }
});

// Route pour créer un paiement
router.post("/paiements", isAuthenticated, async (req, res) => {
  try {
    const { reservationId, montant, fournisseur } = req.body;

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        passagerId: req.user.id
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée ou non autorisée" });
    }

    // Créer le paiement
    const paiement = await prisma.paiement.create({
      data: {
        reservationId,
        utilisateurId: req.user.id,
        montant: parseFloat(montant),
        statut: "REUSSI", // Simulation d'un paiement réussi
        fournisseur: fournisseur || "STRIPE",
        transactionRef: `FAKE-${Date.now()}`
      },
      include: {
        reservation: {
          include: {
            trajet: true
          }
        }
      }
    });

    // Mettre à jour le statut de la réservation
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { statut: "CONFIRMEE" }
    });

    res.status(201).json(paiement);
  } catch (error) {
    console.error("Erreur lors de la création du paiement:", error);
    res.status(400).json({ error: error.message });
  }
});

// Route pour confirmer qu'un trajet a été effectué
router.post("/trajets/:id/confirmer", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const trajetId = req.params.id;

    // Vérifier que le trajet existe et appartient au conducteur
    const trajet = await prisma.trajet.findUnique({
      where: { id: trajetId },
      include: {
        reservations: true,
        conducteur: true
      }
    });

    if (!trajet) {
      return res.status(404).json({ error: "Trajet non trouvé" });
    }

    if (trajet.conducteurId !== req.user.id) {
      return res.status(403).json({ error: "Non autorisé" });
    }

    // Vérifier que le trajet est dans le passé
    if (new Date(trajet.date) > new Date()) {
      return res.status(400).json({ error: "Ce trajet n'a pas encore eu lieu" });
    }

    // Mettre à jour le trajet
    const updatedTrajet = await prisma.$transaction(async (prisma) => {
      // Mettre à jour le trajet
      const updatedTrajet = await prisma.trajet.update({
        where: { id: trajetId },
        data: {
          effectue: true
        },
        include: {
          reservations: {
            include: {
              passager: {
                select: {
                  id: true,
                  nom: true,
                  email: true,
                  numero: true,
                  dateNaissance: true
                }
              }
            }
          },
          conducteur: true
        }
      });

      // Mettre à jour toutes les réservations en attente
      await prisma.reservation.updateMany({
        where: {
          trajetId: trajetId,
          statut: "EN_ATTENTE"
        },
        data: {
          statut: "CONFIRMEE"
        }
      });

      return updatedTrajet;
    });

    res.json(updatedTrajet);
  } catch (error) {
    console.error("Erreur lors de la confirmation du trajet:", error);
    res.status(500).json({ error: "Erreur serveur lors de la confirmation du trajet" });
  }
});

// Route pour ajouter un avis
router.post("/avis", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const { note, commentaire, conducteurId, reservationId } = req.body;

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        trajet: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ error: "Réservation non trouvée" });
    }

    if (reservation.passagerId !== req.user.id) {
      return res.status(403).json({ error: "Non autorisé" });
    }

    if (reservation.statut !== "CONFIRMEE") {
      return res.status(400).json({ error: "La réservation n'est pas confirmée" });
    }

    // Vérifier si un avis existe déjà
    const avisExistant = await prisma.avis.findFirst({
      where: {
        auteurId: req.user.id,
        cibleId: conducteurId,
        reservationId: reservationId
      }
    });

    if (avisExistant) {
      return res.status(400).json({ error: "Vous avez déjà donné votre avis pour cette réservation" });
    }

    // Créer l'avis
    const avis = await prisma.avis.create({
      data: {
        note: parseInt(note),
        commentaire,
        auteurId: req.user.id,
        cibleId: conducteurId,
        reservationId: reservationId,
        date: new Date()
      },
      include: {
        auteur: {
          select: {
            id: true,
            nom: true,
            email: true
          }
        },
        cible: {
          select: {
            id: true,
            nom: true,
            email: true
          }
        }
      }
    });

    res.json(avis);
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'avis:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour récupérer les avis d'un conducteur
router.get("/avis/conducteur/:id", async (req, res) => {
  try {
    const conducteurId = req.params.id;

    const avis = await prisma.avis.findMany({
      where: {
        cibleId: conducteurId
      },
      include: {
        auteur: {
          select: {
            id: true,
            nom: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Calculer la moyenne des notes
    const moyenne = avis.length > 0 
      ? (avis.reduce((sum, a) => sum + a.note, 0) / avis.length).toFixed(1)
      : 0;

    res.json({
      avis,
      moyenne,
      total: avis.length
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des avis:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Liste des utilisateurs (admin only)
router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nom: true,
        type: true,
        numero: true,
        dateNaissance: true,
        banni: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
  }
});

// Liste des trajets (admin only)
router.get("/admin/trajets", requireAdmin, async (req, res) => {
  try {
    const trajets = await prisma.trajet.findMany({
      include: {
        conducteur: { select: { id: true, nom: true, email: true } }
      }
    });
    res.json(trajets);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des trajets" });
  }
});

// Bannir ou débannir un utilisateur (admin)
router.patch("/admin/users/:id/ban", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { banni } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { banni: !!banni }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors du bannissement/dé-bannissement" });
  }
});

// Supprimer un trajet (admin)
router.delete("/admin/trajets/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // Vérifier s'il y a des réservations
    const reservations = await prisma.reservation.findMany({ where: { trajetId: id } });
    if (reservations.length > 0) {
      return res.status(400).json({ error: "Impossible de supprimer un trajet qui a des réservations" });
    }
    await prisma.trajet.delete({ where: { id } });
    res.json({ message: "Trajet supprimé par l'admin" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression du trajet" });
  }
});

// Route pour envoyer un message de contact
router.post("/contact", async (req, res) => {
  try {
    const { nom, email, sujet, message } = req.body;

    // Vérification des champs requis
    if (!nom || !email || !sujet || !message) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }

    // Création du message de contact
    const contact = await prisma.contact.create({
      data: {
        nom,
        email,
        sujet,
        message
      }
    });

    res.status(201).json({ 
      message: "Message envoyé avec succès",
      contact 
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi du message" });
  }
});

// Route pour récupérer tous les messages de contact (admin only)
router.get("/admin/contacts", requireAdmin, async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: {
        creeLe: 'desc'
      }
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des messages" });
  }
});

// Route pour marquer un message comme lu (admin)
router.patch("/admin/contacts/:id/read", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await prisma.contact.update({
      where: { id },
      data: { lu: true }
    });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du message" });
  }
});

// Route pour supprimer un message de contact (admin)
router.delete("/admin/contacts/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contact.delete({ where: { id } });
    res.json({ message: "Message supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression du message" });
  }
});

export default router;
