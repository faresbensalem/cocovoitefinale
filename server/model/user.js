import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// 🔍 Récupérer un utilisateur par son email
export const getUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

// 🔍 Récupérer un utilisateur par son ID
export const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

// ➕ Ajouter un utilisateur
export const addUser = async (email, motDePasse, nom, numero, dateNaissance) => {
  return await prisma.user.create({
    data: {
      email,
      motDePasse: await bcrypt.hash(motDePasse, 10),
      nom,
      numero,
      dateNaissance,
      type: "UTILISATEUR", // correspond à l'enum défini dans Prisma
    },
  });
};
