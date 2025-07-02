import "dotenv/config";
import express, { json } from "express";

import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import cspOption from "./csp-options.js";
import routerExterne from "./routes.js";

const app = express();

app.use(helmet(cspOption));
app.use(compression());
app.use(cors());
app.use(json());

app.use(express.static("public"));

// Ajout du préfixe /api pour toutes les routes de routerExterne
app.use(express.json());
app.use('/', routerExterne);

// Gestion des routes non définies
app.use((req, res) => {
  res.status(404).send(`${req.originalUrl} Route introuvable.`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.info("Serveur démarré :");
  console.info(`http://localhost:${PORT}`);
});
