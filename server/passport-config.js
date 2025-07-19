import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "motDePasse",
    },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!user) {
          return done(null, false, { message: "Email incorrect" });
        }

        // Vérifier si l'utilisateur est banni
        if (user.banni) {
          return done(null, false, { message: "Votre compte a été banni par un administrateur" });
        }

        const isValid = await bcrypt.compare(password, user.motDePasse);

        if (!isValid) {
          return done(null, false, { message: "Mot de passe incorrect" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        nom: true,
        numero: true,
        dateNaissance: true,
        type: true,
        banni: true,
      },
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
