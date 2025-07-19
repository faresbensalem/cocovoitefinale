"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope, FaLock, FaPhone } from "react-icons/fa";
import Link from "next/link";

export default function Inscription() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    birthdate: "",
    phone: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loginAfterRegistration = async (email, password) => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          motDePasse: password,
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur de connexion automatique");
      }

      const data = await res.json();
      console.log("Connexion automatique réussie:", data);
      
      // Vérifier la session
      const sessionRes = await fetch("http://localhost:5000/check-session", {
        credentials: "include"
      });
      const sessionData = await sessionRes.json();
      console.log("Session après connexion:", sessionData);

      return true;
    } catch (error) {
      console.error("Erreur lors de la connexion automatique:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      console.log("Tentative d'inscription...");
      
      // Formatage de la date de naissance
      const dateNaissance = formData.birthdate ? new Date(formData.birthdate).toISOString() : null;
      
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: formData.username,
          email: formData.email,
          motDePasse: formData.password,
          dateNaissance: dateNaissance,  // Envoi de la date formatée
          numero: formData.phone || null,  // Envoi de null si vide
        }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Inscription réussie, tentative de connexion automatique...");
        setMessage("Inscription réussie ! Connexion en cours...");
        
        const loginSuccess = await loginAfterRegistration(formData.email, formData.password);
        
        if (loginSuccess) {
          setMessage("Inscription et connexion réussies !");
          window.location.href = '/';
        } else {
          setMessage("Inscription réussie mais erreur de connexion automatique. Veuillez vous connecter manuellement.");
          window.location.href = '/connexion';
        }
      } else {
        setMessage(data.error || "Erreur lors de l'inscription.");
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      setMessage("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  // Calcul de la date max pour avoir 18 ans révolus
  const today = new Date();
  const maxBirthdate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const maxBirthdateStr = maxBirthdate.toISOString().split("T")[0];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-cover bg-center font-sans">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
        <div className="md:w-1/2 p-12 flex flex-col justify-center text-gray-800">
          <h2 className="text-4xl font-extrabold mb-4">
            Rejoignez <span className="text-blue-600">Cocovoit</span> dès aujourd'hui
          </h2>
          <p className="text-lg leading-relaxed">
            La meilleure application du Canada.<br />
            Inscrivez-vous et commencez à voyager avec nous.
          </p>
        </div>

        <div className="md:w-1/2 p-12 bg-white">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 text-gray-700 font-medium">Nom d'utilisateur</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                <input
                  type="text"
                  name="username"
                  placeholder="Votre nom d'utilisateur"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
                  onChange={handleChange}
                  value={formData.username}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium">Adresse e-mail</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
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
                  name="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
                  onChange={handleChange}
                  value={formData.password}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium">Date de naissance</label>
              <input
                type="date"
                name="birthdate"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
                onChange={handleChange}
                value={formData.birthdate}
                max={maxBirthdateStr}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 font-medium">Numéro de téléphone</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 555 123 4567"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
                  onChange={handleChange}
                  value={formData.phone}
                  required
                  pattern="[0-9+\s-]+"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition duration-300 ${
                loading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? "Inscription en cours..." : "S'inscrire"}
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
            Vous avez déjà un compte ?{" "}
            <Link href="/connexion" className="text-gray-800 hover:underline font-medium">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
