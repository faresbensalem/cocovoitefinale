"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaLock } from "react-icons/fa";
import Link from "next/link";

export default function Connexion() {
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const [formData, setFormData] = useState({ email: "", motDePasse: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [banni, setBanni] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("http://localhost:5000/check-session", { credentials: "include" });
        const data = await res.json();
        if (data.isAuthenticated && data.user) {
          if (data.user.banni) {
            setBanni(true);
            return;
          }
          if (data.user.type === "ADMIN") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/";
          }
        }
      } catch (error) {
        console.error("Erreur de connexion:", error);
        setMessage("Erreur de connexion au serveur.");
      }
    };
    checkSession();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      console.log("Tentative de connexion avec:", formData.email);
      
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          motDePasse: formData.motDePasse,
        }),
      });

      const data = await res.json();
      console.log("Réponse du serveur:", data);

      if (res.ok) {
        setMessage("Connexion réussie !");
        // Vérifier le type de l'utilisateur connecté
        const sessionRes = await fetch("http://localhost:5000/check-session", { credentials: "include" });
        const sessionData = await sessionRes.json();
        console.log("DEBUG /check-session:", sessionData);
        if (sessionData.isAuthenticated && sessionData.user) {
          if (sessionData.user.type === "ADMIN") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/";
          }
        } else {
          setMessage("Erreur lors de la vérification de session. Veuillez réessayer.");
        }
      } else {
        setMessage(data.error || "Erreur lors de la connexion.");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setMessage("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  if (banni) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Compte banni</h2>
          <p className="text-red-600">Votre compte a été banni par un administrateur.<br/>Contactez le support si besoin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-cover bg-center font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
        {/* Texte à gauche */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center text-gray-800">
          <h2 className="text-4xl font-extrabold mb-4">
            Welcome to <span className="text-blue-600">Cocovoit</span>
          </h2>
          <p className="text-lg leading-relaxed">
            La meilleure application du Canada.
            <br />
            Connectez-vous et voyagez avec nous.
          </p>
        </div>

        {/* Formulaire à droite */}
        <div className="md:w-1/2 p-12 bg-white">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Adresse e-mail</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={handleChange}
                  value={formData.email}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium">Mot de passe</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                <input
                  type="password"
                  name="motDePasse"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={handleChange}
                  value={formData.motDePasse}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition duration-300 ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : isFocused
                  ? "bg-blue-700 text-white hover:bg-blue-800"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>

            {message && (
              <p className={`text-center text-sm mt-2 ${
                message.includes("réussie") ? "text-green-500" : "text-red-500"
              }`}>
                {message}
              </p>
            )}
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center md:text-left">
            Vous n'avez pas de compte ?{" "}
            <Link href="/inscription" className="text-gray-800 hover:underline font-medium">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
