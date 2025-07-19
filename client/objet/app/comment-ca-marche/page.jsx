import React from "react";
import { FaCarSide, FaUserFriends, FaMoneyBillWave, FaRegSmile } from "react-icons/fa";

export default function CommentCaMarche() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-8">
        <h1 className="text-4xl font-bold text-blue-700 mb-6 text-center flex items-center justify-center gap-2">
          <FaCarSide className="text-blue-500" />
          Comment ça marche ?
        </h1>
        <p className="text-lg text-gray-700 mb-8 text-center">
          Le covoiturage, c'est partager un trajet en voiture avec d'autres personnes pour économiser, réduire son impact écologique et rencontrer de nouvelles personnes. Voici comment ça fonctionne sur notre plateforme :
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center text-center">
            <FaUserFriends className="text-5xl text-blue-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">1. Trouver ou proposer un trajet</h2>
            <p className="text-gray-600">Recherchez un trajet existant ou publiez le vôtre en quelques clics. Indiquez la date, l'heure, le lieu de départ et d'arrivée.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <FaMoneyBillWave className="text-5xl text-green-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">2. Réserver et partager les frais</h2>
            <p className="text-gray-600">Réservez votre place ou acceptez des passagers. Le prix est fixé à l'avance pour partager équitablement les frais du trajet.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <FaRegSmile className="text-5xl text-yellow-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">3. Voyager ensemble</h2>
            <p className="text-gray-600">Le jour J, retrouvez-vous au point de rendez-vous et profitez d'un trajet convivial, économique et écologique !</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <FaCarSide className="text-5xl text-blue-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">4. Laissez un avis</h2>
            <p className="text-gray-600">Après le trajet, laissez un avis sur vos co-voyageurs pour renforcer la confiance et la sécurité de la communauté.</p>
          </div>
        </div>
        <div className="mt-10 text-center">
          <span className="inline-block bg-blue-100 text-blue-700 px-6 py-3 rounded-full font-semibold text-lg shadow">
            Prêt à tenter l'expérience ? <span className="underline">Inscrivez-vous ou recherchez un trajet dès maintenant !</span>
          </span>
        </div>
      </div>
    </div>
  );
} 