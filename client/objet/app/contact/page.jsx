"use client";
import React, { useState } from "react";
import { FaPhone, FaEnvelope, FaUser, FaComments } from "react-icons/fa";

export default function Contact() {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    sujet: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Message envoyé ! Nous vous répondrons dans les plus brefs délais.");
        setFormData({ nom: "", email: "", sujet: "", message: "" });
      } else {
        alert(data.error || "Erreur lors de l'envoi du message");
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert("Erreur lors de l'envoi du message");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-8">
        <h1 className="text-4xl font-bold text-blue-700 mb-6 text-center flex items-center justify-center gap-2">
          <FaEnvelope className="text-blue-500" />
          Contactez-nous
        </h1>
        <p className="text-lg text-gray-700 mb-8 text-center">
          Notre équipe support est là pour vous aider. N'hésitez pas à nous contacter !
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
              <FaPhone className="text-blue-500" />
              Support téléphonique
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Support principal :</span>
                <span className="font-semibold text-blue-700">514-247-1702</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Support secondaire :</span>
                <span className="font-semibold text-blue-700">514-000-0000</span>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Disponible du lundi au vendredi, 9h à 18h
              </p>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-green-700 mb-4 flex items-center gap-2">
              <FaComments className="text-green-500" />
              Formulaire de contact
            </h2>
            <p className="text-gray-600">
              Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre nom complet"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="sujet" className="block text-sm font-medium text-gray-700 mb-2">
              Sujet *
            </label>
            <input
              type="text"
              id="sujet"
              name="sujet"
              value={formData.sujet}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Sujet de votre message"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Décrivez votre problème ou question..."
            />
          </div>
          
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              <FaEnvelope />
              Envoyer le message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 