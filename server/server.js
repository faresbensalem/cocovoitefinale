import "dotenv/config";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import "./passport-config.js";
import routes from "./routes.js";

const app = express();

// Configuration de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration CORS
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Configuration de sécurité
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(compression());

// Configuration des sessions
app.use(session({
  secret: "votre_secret_ici",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true en production avec HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Configuration de Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware de debug
app.use((req, res, next) => {
  console.log("Session ID:", req.sessionID);
  console.log("Authenticated:", req.isAuthenticated());
  console.log("User:", req.user);
  next();
});

// Routes
app.use("/", routes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erreur serveur" });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
