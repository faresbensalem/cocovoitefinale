"use client";
import { SiGooglemaps } from "react-icons/si";
import { useState, useRef } from "react";
import { LoadScript, GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";
import { CiCalendarDate } from "react-icons/ci";
import { FaDollarSign, FaDog } from "react-icons/fa";
import { IoPeople } from "react-icons/io5";
import { FcPrevious, FcNext } from "react-icons/fc";
import { MdLuggage } from "react-icons/md";
import Link from "next/link";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 48.8566,
  lng: 2.3522,
};

export default function Publier() {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const [formData, setFormData] = useState({
    depart: "",
    adresseDepart: "",
    destination: "",
    adresseArrivee: "",
    date: "",
    places: 1,
    prix: 0,
    conducteurId: "",
    animauxAcceptes: false,
    bagagesAcceptes: true,
  });

  const [mapCoords, setMapCoords] = useState({
    departLat: defaultCenter.lat,
    departLng: defaultCenter.lng,
    arriveeLat: defaultCenter.lat,
    arriveeLng: defaultCenter.lng,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const departAutocompleteRef = useRef(null);
  const arriveeAutocompleteRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePlaceSelect = (autocomplete, field) => {
    const place = autocomplete.getPlace();
    if (place.geometry && place.address_components) {
      const address = place.formatted_address;
      const cityComponent = place.address_components.find((comp) =>
        comp.types.includes("locality") || comp.types.includes("administrative_area_level_2")
      );
      const city = cityComponent ? cityComponent.long_name : "";

      if (field === "depart") {
        setFormData((prev) => ({
          ...prev,
          depart: city,
          adresseDepart: address,
        }));
        setMapCoords((prev) => ({
          ...prev,
          departLat: place.geometry.location.lat(),
          departLng: place.geometry.location.lng(),
        }));
      } else if (field === "arrivee") {
        setFormData((prev) => ({
          ...prev,
          destination: city,
          adresseArrivee: address,
        }));
        setMapCoords((prev) => ({
          ...prev,
          arriveeLat: place.geometry.location.lat(),
          arriveeLng: place.geometry.location.lng(),
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/trajets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        setSuccessMessage("Trajet ajouté avec succès !");
        setError(null);
        setShowPopup(true);
      } else {
        setError(result.error || "Erreur lors de l'ajout du trajet.");
      }
    } catch (err) {
      setError("Erreur lors de la soumission du formulaire.");
    }
  };

  const nextPage = () => {
    if (currentPage < 3) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Ajouter un trajet</h1>
        {error && <div className="text-red-500 text-sm mb-4">⚠️ {error}</div>}
        {successMessage && <div className="text-green-500 text-sm mb-4">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col justify-between min-h-[550px] space-y-6">
          {/* Page 1 */}
          {currentPage === 1 && (
            <>
              <div className="flex justify-between mb-6">
                <div className="w-1/2 pr-4">
                  <label htmlFor="depart" className="block text-lg font-semibold text-gray-800 mb-2">Adresse de départ</label>
                  <div className="relative">
                    <Autocomplete
                      onLoad={(autocomplete) => (departAutocompleteRef.current = autocomplete)}
                      onPlaceChanged={() => handlePlaceSelect(departAutocompleteRef.current, "depart")}
                    >
                      <input
                        type="text"
                        id="depart"
                        name="adresseDepart"
                        value={formData.adresseDepart}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-lg pl-10 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        placeholder="Rechercher une adresse de départ"
                        required
                      />
                    </Autocomplete>
                    <SiGooglemaps className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" size={20} />
                  </div>
                </div>

                <div className="w-1/2 pl-4">
                  <label htmlFor="destination" className="block text-lg font-semibold text-gray-800 mb-2">Adresse de destination</label>
                  <div className="relative">
                    <Autocomplete
                      onLoad={(autocomplete) => (arriveeAutocompleteRef.current = autocomplete)}
                      onPlaceChanged={() => handlePlaceSelect(arriveeAutocompleteRef.current, "arrivee")}
                    >
                      <input
                        type="text"
                        id="destination"
                        name="adresseArrivee"
                        value={formData.adresseArrivee}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-lg pl-10 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        placeholder="Rechercher une adresse d'arrivée"
                        required
                      />
                    </Autocomplete>
                    <SiGooglemaps className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" size={20} />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <div className="w-1/2 pr-4 h-93">
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={{ lat: mapCoords.departLat, lng: mapCoords.departLng }}
                    zoom={12}
                  >
                    <Marker position={{ lat: mapCoords.departLat, lng: mapCoords.departLng }} />
                  </GoogleMap>
                </div>

                <div className="w-1/2 pl-4 h-93">
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={{ lat: mapCoords.arriveeLat, lng: mapCoords.arriveeLng }}
                    zoom={12}
                  >
                    <Marker position={{ lat: mapCoords.arriveeLat, lng: mapCoords.arriveeLng }} />
                  </GoogleMap>
                </div>
              </div>
            </>
          )}

          {/* Page 2 */}
          {currentPage === 2 && (
            <>
              <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Informations du trajet</h2>

              <div className="mb-6">
                <label htmlFor="date" className="block text-lg font-semibold text-gray-800 mb-2">Date de départ</label>
                <div className="flex items-center rounded-md px-4 py-3 bg-white border border-gray-300 shadow-md w-full">
                  <CiCalendarDate className="text-gray-500 text-2xl mr-3" />
                  <input
                    type="datetime-local"
                    id="date"
                    name="date"
                    value={formData.date || ""}
                    onChange={handleChange}
                    className="w-full focus:outline-none bg-transparent text-lg"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="places" className="block text-lg font-semibold text-gray-800 mb-2">Nombre de places</label>
                <div className="flex items-center rounded-md px-4 py-3 bg-white border border-gray-300 shadow-md w-full">
                  <IoPeople className="text-gray-500 text-2xl mr-3" />
                  <input
                    type="text"
                    id="places"
                    name="places"
                    min="1"
                    value={formData.places || ""}
                    onChange={handleChange}
                    className="w-full focus:outline-none bg-transparent text-lg"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="prix" className="block text-lg font-semibold text-gray-800 mb-2">Prix</label>
                <div className="flex items-center rounded-md px-4 py-3 bg-white border border-gray-300 shadow-md w-full">
                  <FaDollarSign className="text-gray-500 text-2xl mr-3" />
                  <input
                    type="text"
                    id="prix"
                    name="prix"
                    step="0.01"
                    value={formData.prix || ""}
                    onChange={handleChange}
                    className="w-full focus:outline-none bg-transparent text-lg"
                    required
                  />
                </div>
              </div>
            </>
          )}

{/* Page 3 */}
{currentPage === 3 && (
  <>
    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Préférences de votre trajet</h2>

    {/* Champ conducteur */}
    <div className="mb-6">
      <label htmlFor="conducteurId" className="block text-lg font-semibold text-gray-800 mb-2">ID du conducteur</label>
      <input
        type="text"
        id="conducteurId"
        name="conducteurId"
        value={formData.conducteurId}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-md text-lg"
        required
      />
    </div>

    {/* Préférences sélectionnables */}
    <div className="flex gap-4">
      {/* Animaux acceptés */}
      <div
        onClick={() =>
          handleChange({
            target: {
              name: "animauxAcceptes",
              value: !formData.animauxAcceptes,
              type: "checkbox",
              checked: !formData.animauxAcceptes,
            },
          })
        }
        className={`cursor-pointer flex items-center justify-center gap-2 border rounded-xl px-6 py-4 w-full shadow-md transition ${
          formData.animauxAcceptes
            ? "bg-blue-100 border-blue-400"
            : "bg-white border-gray-300"
        }`}
      >
        <FaDog className="text-2xl text-gray-700" />
        <span className="text-lg font-medium text-gray-700">Animaux acceptés</span>
      </div>

      {/* Bagages acceptés */}
      <div
        onClick={() =>
          handleChange({
            target: {
              name: "bagagesAcceptes",
              value: !formData.bagagesAcceptes,
              type: "checkbox",
              checked: !formData.bagagesAcceptes,
            },
          })
        }
        className={`cursor-pointer flex items-center justify-center gap-2 border rounded-xl px-6 py-4 w-full shadow-md transition ${
          formData.bagagesAcceptes
            ? "bg-blue-100 border-blue-400"
            : "bg-white border-gray-300"
        }`}
      >
        <MdLuggage className="text-2xl text-gray-700" />
        <span className="text-lg font-medium text-gray-700">Bagages acceptés</span>
      </div>
    </div>
  </>
)}
          {/* Navigation */}
          <div className="pt-4">
            <div className="flex justify-between items-center">
              {currentPage > 1 ? (
                <button type="button" onClick={prevPage} className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-medium shadow hover:bg-gray-300 transition">
                  <FcPrevious className="text-2xl" /> Précédent
                </button>
              ) : <div />}

              {currentPage < 3 ? (
                <button type="button" onClick={nextPage} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow hover:bg-blue-700 transition">
                  Suivant <FcNext className="text-2xl" />
                </button>
              ) : (
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium shadow hover:bg-green-700 transition">
                  ✔ Ajouter le trajet
                </button>
              )}
            </div>
          </div>
        </form>

        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm w-full">
              <h2 className="text-2xl font-bold text-green-600 mb-4">✅ Trajet publié !</h2>
              <p className="text-gray-700 mb-6">Votre trajet a été ajouté avec succès.</p>
            <Link href="/mestrajet" passHref>
  <button 
    onClick={() => window.location.reload()} 
    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow hover:bg-blue-700 transition"
  >
   retour a l'acuille 
  </button>
</Link>
            </div>
          </div>
        )}
      </div>
    </LoadScript>
  );
}
