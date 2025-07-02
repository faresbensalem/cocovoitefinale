import { FaRegIdCard } from "react-icons/fa";
import { TbPigMoney } from "react-icons/tb";
import { CiStopwatch } from "react-icons/ci";

export default function Section() {
  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {/* Bloc 1 */}
          <div className="flex flex-col items-center">
            <TbPigMoney className="text-3xl text-teal-800 mb-4" />
            <h3 className="text-lg font-semibold text-teal-900 mb-2">Vos trajets préférés à petits prix</h3>
            <p className="text-gray-600">
              Où que vous alliez, en bus ou en covoiturage, trouvez le trajet idéal parmi notre large choix de destinations à petits prix.
            </p>
          </div>

          {/* Bloc 2 */}
          <div className="flex flex-col items-center">
            <FaRegIdCard className="text-3xl text-teal-800 mb-4" />
            <h3 className="text-lg font-semibold text-teal-900 mb-2">Voyagez en toute confiance</h3>
            <p className="text-gray-600">
              Nous prenons le temps qu’il faut pour connaître nos membres et nos compagnies de bus partenaires. Nous vérifions les avis, les profils et les pièces d’identité.
            </p>
          </div>

          {/* Bloc 3 */}
          <div className="flex flex-col items-center">
            <CiStopwatch className="text-3xl text-teal-800 mb-4" />
            <h3 className="text-lg font-semibold text-teal-900 mb-2">Recherchez, cliquez et réservez !</h3>
            <p className="text-gray-600">
              Réserver un trajet devient encore plus simple ! Facile d'utilisation et dotée de technologies avancées, notre appli vous permet de réserver un trajet à proximité en un rien de temps.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
