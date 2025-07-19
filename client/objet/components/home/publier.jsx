"use client";

import { SiGooglemaps } from "react-icons/si";
import { useState, useRef, useEffect } from "react";
import { LoadScript, GoogleMap, Marker, Autocomplete } from "@react-google-maps/api";
import { CiCalendarDate } from "react-icons/ci";
import { FaDollarSign, FaDog, FaCar } from "react-icons/fa";
import { IoPeople } from "react-icons/io5";
import { FcPrevious, FcNext } from "react-icons/fc";
import { MdLuggage } from "react-icons/md";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const [user, setUser] = useState(null);
  const [userVehicles, setUserVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleWarning, setShowVehicleWarning] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  const [formData, setFormData] = useState({
    depart: "",
    adresseDepart: "",
    destination: "",
    adresseArrivee: "",
    date: null, // On stocke un objet Date natif
    places: 1,
    prix: 0,
    animauxAcceptes: false,
    bagagesAcceptes: true,
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Vérification de la session...");
        const res = await fetch("http://localhost:5000/check-session", {
          credentials: "include",
        });
        
        if (!res.ok) throw new Error("Session invalide");
        
        const data = await res.json();
        if (data.isAuthenticated && data.user) {
          console.log("Utilisateur connecté:", data.user);
          setUser(data.user);
          await fetchUserVehicles(data.user.id);
        }
      } catch (error) {
        console.error("Erreur session:", error);
        setUser(null);
      }
    };

    const fetchUserVehicles = async (userId) => {
      try {
        console.log("Récupération des voitures pour l'utilisateur:", userId);
        setIsLoadingVehicles(true);
        const res = await fetch(`http://localhost:5000/voiture/${userId}`, {
          credentials: "include"
        });

        if (!res.ok) {
          throw new Error("Erreur lors de la récupération des voitures");
        }

        const data = await res.json();
        console.log("Voitures reçues:", data);

        if (Array.isArray(data)) {
          setUserVehicles(data);
          setShowVehicleWarning(data.length === 0);
        } else {
          console.error("Format de données invalide pour les voitures:", data);
          setUserVehicles([]);
          setShowVehicleWarning(true);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des voitures:", error);
        setUserVehicles([]);
        setShowVehicleWarning(true);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    checkSession();
  }, []);

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
    if (!user) {
      setError("Vous devez être connecté pour publier un trajet.");
      return;
    }

    if (!selectedVehicle) {
      setError("Vous devez sélectionner une voiture pour le trajet.");
      return;
    }

    try {
      const trajetData = {
        ...formData,
        date: formData.date ? formData.date.toISOString() : "",
        conducteurId: user.id,
        voitureId: selectedVehicle // Ajout de l'ID de la voiture
      };

      const response = await fetch("http://localhost:5000/trajets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(trajetData),
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Accès non autorisé</h2>
          <p className="text-gray-700 mb-6">Vous devez être connecté pour publier un trajet.</p>
          <Link href="/connexion" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow hover:bg-blue-700 transition">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (showVehicleWarning) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">🚗</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ajoutez d'abord une voiture</h2>
          <p className="text-gray-600 mb-6">
            Pour publier un trajet, vous devez d'abord ajouter une voiture à votre profil.
          </p>
          <Link 
            href="/voiture"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow hover:bg-blue-700 transition inline-block"
          >
            Ajouter une voiture
          </Link>
        </div>
      </div>
    );
  }

  // Calcul de la date d'hier à minuit
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <div className="max-w-5xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* En-tête du formulaire */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <h1 className="text-3xl font-bold text-center">Publier un trajet</h1>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-4">
                <div className={`flex items-center ${currentPage === 1 ? 'text-white' : 'text-blue-200'}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentPage === 1 ? 'border-white bg-blue-700' : 'border-blue-200'}`}>1</span>
                  <span className="ml-2">Itinéraire</span>
                </div>
                <div className="border-t-2 border-blue-400 w-16 mt-4"></div>
                <div className={`flex items-center ${currentPage === 2 ? 'text-white' : 'text-blue-200'}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentPage === 2 ? 'border-white bg-blue-700' : 'border-blue-200'}`}>2</span>
                  <span className="ml-2">Détails</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
              <div className="flex">
                <div className="flex-shrink-0">⚠️</div>
                <div className="ml-3">
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 m-6">
              <div className="flex">
                <div className="flex-shrink-0">✅</div>
                <div className="ml-3">
                  <p className="text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6">
            {/* Page 1: Itinéraire */}
            {currentPage === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Départ */}
                  <div>
                    <label htmlFor="depart" className="block text-lg font-semibold text-gray-800 mb-2">
                      Point de départ
                    </label>
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          placeholder="Saisissez l'adresse de départ"
                          required
                        />
                      </Autocomplete>
                      <SiGooglemaps className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
                    </div>
                    <div className="mt-4 h-[200px]">
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '8px' }}
                        center={{ lat: mapCoords.departLat, lng: mapCoords.departLng }}
                        zoom={12}
                      >
                        <Marker position={{ lat: mapCoords.departLat, lng: mapCoords.departLng }} />
                      </GoogleMap>
                    </div>
                  </div>

                  {/* Destination */}
                  <div>
                    <label htmlFor="destination" className="block text-lg font-semibold text-gray-800 mb-2">
                      Destination
                    </label>
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          placeholder="Saisissez la destination"
                          required
                        />
                      </Autocomplete>
                      <SiGooglemaps className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
                    </div>
                    <div className="mt-4 h-[200px]">
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '8px' }}
                        center={{ lat: mapCoords.arriveeLat, lng: mapCoords.arriveeLng }}
                        zoom={12}
                      >
                        <Marker position={{ lat: mapCoords.arriveeLat, lng: mapCoords.arriveeLng }} />
                      </GoogleMap>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page 2 */}
            {currentPage === 2 && (
              <>
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Informations du trajet</h2>

                <div className="space-y-6">
                  {/* Date et Heure */}
                  <div className="mb-6">
                    <label htmlFor="date" className="block text-lg font-semibold text-gray-800 mb-2">Date et heure de départ</label>
                    <div className="flex flex-col items-center">
                      <DatePicker
                        selected={formData.date}
                        onChange={date => setFormData(prev => ({ ...prev, date }))}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy HH:mm"
                        minDate={yesterday}
                        inline
                        calendarClassName="rounded-xl shadow-lg border border-blue-200 bg-white p-2"
                        required
                      />
                    </div>
                  </div>

                  {/* Nombre de places */}
                  <div className="mb-6">
                    <label htmlFor="places" className="block text-lg font-semibold text-gray-800 mb-2">Nombre de places</label>
                    <div className="relative">
                      <IoPeople className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 text-xl" />
                      <input
                        type="number"
                        id="places"
                        name="places"
                        min="1"
                        max="8"
                        value={formData.places}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Prix */}
                  <div className="mb-6">
                    <label htmlFor="prix" className="block text-lg font-semibold text-gray-800 mb-2">Prix par passager</label>
                    <div className="relative">
                      <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 text-xl" />
                      <input
                        type="number"
                        id="prix"
                        name="prix"
                        min="0"
                        step="0.01"
                        value={formData.prix}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Sélection de la voiture */}
                  <div className="mb-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-4">
                      Sélectionnez votre voiture pour le trajet
                    </label>
                    {isLoadingVehicles ? (
                      <div className="text-center p-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Chargement de vos voitures...</p>
                      </div>
                    ) : userVehicles.length === 0 ? (
                      <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-3xl mb-2">🚗</div>
                        <p className="text-gray-700 mb-4">Vous n'avez pas encore ajouté de voiture.</p>
                        <Link 
                          href="/voiture"
                          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Ajouter une voiture
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {userVehicles.map((vehicle) => (
                          <div
                            key={vehicle.id}
                            onClick={() => setSelectedVehicle(vehicle.id)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedVehicle === vehicle.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`p-3 rounded-full ${
                                selectedVehicle === vehicle.id ? "bg-blue-100" : "bg-gray-100"
                              }`}>
                                <FaCar className={`text-2xl ${
                                  selectedVehicle === vehicle.id ? "text-blue-500" : "text-gray-400"
                                }`} />
                              </div>
                              <div className="ml-4">
                                <div className="font-semibold text-lg">
                                  {vehicle.marque} {vehicle.modele}
                                </div>
                                <div className="text-gray-500">
                                  {vehicle.couleur} • {vehicle.immatriculation}
                                </div>
                              </div>
                              {selectedVehicle === vehicle.id && (
                                <div className="ml-auto">
                                  <div className="bg-blue-500 text-white rounded-full p-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Préférences */}
                  <div className="mb-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-4">Options du trajet</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Animaux acceptés */}
                      <div
                        onClick={() => handleChange({
                          target: {
                            name: "animauxAcceptes",
                            type: "checkbox",
                            checked: !formData.animauxAcceptes
                          }
                        })}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.animauxAcceptes 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className={`p-2 rounded-full ${formData.animauxAcceptes ? "bg-blue-100" : "bg-gray-100"}`}>
                          <FaDog className={`text-2xl ${formData.animauxAcceptes ? "text-blue-500" : "text-gray-400"}`} />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">Animaux acceptés</div>
                          <div className="text-sm text-gray-500">Autoriser les animaux de compagnie</div>
                        </div>
                      </div>

                      {/* Bagages acceptés */}
                      <div
                        onClick={() => handleChange({
                          target: {
                            name: "bagagesAcceptes",
                            type: "checkbox",
                            checked: !formData.bagagesAcceptes
                          }
                        })}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.bagagesAcceptes 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className={`p-2 rounded-full ${formData.bagagesAcceptes ? "bg-blue-100" : "bg-gray-100"}`}>
                          <MdLuggage className={`text-2xl ${formData.bagagesAcceptes ? "text-blue-500" : "text-gray-400"}`} />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">Bagages acceptés</div>
                          <div className="text-sm text-gray-500">Autoriser les bagages</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="mt-8 flex justify-between">
              {currentPage > 1 && (
                <button
                  type="button"
                  onClick={prevPage}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center"
                >
                  <FcPrevious className="mr-2" /> Retour
                </button>
              )}
              
              {currentPage < 2 ? (
                <button
                  type="button"
                  onClick={nextPage}
                  className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                >
                  Suivant <FcNext className="ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="ml-auto px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
                >
                  Publier le trajet ✓
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Popup de succès */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full mx-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-green-500">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Trajet publié !</h2>
              <p className="text-gray-600 mb-6">Votre trajet a été ajouté avec succès.</p>
              <Link href="/mestrajet" passHref>
                <button 
                  onClick={() => window.location.href = '/mestrajet'} 
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Voir mes trajets
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </LoadScript>
  );
}
