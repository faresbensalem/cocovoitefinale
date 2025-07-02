import Image from "next/image";
import logo from "@/public/img/footerimg.png";
import { FaInstagram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-10 pb-6 mt-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src={logo} alt="CocoCovoit logo" width={300} height={80} />
        </div>

        {/* Contenu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* À propos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">À propos</h3>
            <p className="text-sm text-gray-300">
              CocoCovoit est une plateforme de covoiturage simple, économique et écologique pour vos trajets quotidiens ou occasionnels.
            </p>
          </div>

          {/* Liens utiles */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens utiles</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:underline">Rechercher un trajet</a></li>
              <li><a href="#" className="hover:underline">Publier un trajet</a></li>
              <li><a href="#" className="hover:underline">Mon compte</a></li>
              <li><a href="#" className="hover:underline">Support</a></li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suivez-nous</h3>
            <div className="flex flex-col space-y-2 text-sm text-gray-300">
              <a href="#" className="flex items-center space-x-2 hover:text-blue-500">
                <FaFacebook />
                <span>Facebook</span>
              </a>
              <a href="#" className="flex items-center space-x-2 hover:text-pink-400">
                <FaInstagram />
                <span>Instagram</span>
              </a>
              <a href="#" className="flex items-center space-x-2 hover:text-blue-300">
                <FaXTwitter />
                <span>Twitter</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} CocoCovoit. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
