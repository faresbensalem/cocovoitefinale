"use client";
import { useState, useEffect } from "react";
import { FaMapSigns } from "react-icons/fa";
import { SiGooglemaps } from "react-icons/si";
import { CiCalendarDate } from "react-icons/ci";
import { FaUsersLine } from "react-icons/fa6";
import { MdLuggage } from "react-icons/md";
import { FaDog } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import DatePicker from "react-datepicker";
import Select from "react-select";
import Link from "next/link";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";

const canadianCities = [
  { value: "Toronto", label: "Toronto" },
  { value: "Montréal", label: "Montréal" },
  { value: "Vancouver", label: "Vancouver" },
  { value: "Calgary", label: "Calgary" },
  { value: "Ottawa", label: "Ottawa" },
  { value: "Edmonton", label: "Edmonton" },
  { value: "Québec", label: "Québec" },
  { value: "Winnipeg", label: "Winnipeg" },
  { value: "Halifax", label: "Halifax" },
  { value: "Saskatoon", label: "Saskatoon" },
  { value: "Regina", label: "Regina" },
  { value: "St. John's", label: "St. John's" },
  { value: "Victoria", label: "Victoria" },
  { value: "Gatineau", label: "Gatineau" },
  { value: "Sherbrooke", label: "Sherbrooke" },
  { value: "Windsor", label: "Windsor" },
  { value: "Kelowna", label: "Kelowna" },
  { value: "Trois-Rivières", label: "Trois-Rivières" },
  { value: "Saguenay", label: "Saguenay" },
  { value: "Barrie", label: "Barrie" },
];

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    border: "none",
    boxShadow: "none",
    backgroundColor: "transparent",
    minHeight: "unset",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    padding: 2,
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 50,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#e0f7f5" : "white",
    color: "black",
    padding: 10,
  }),
};

export default function Recherche({
  initialDeparture = null,
  initialDestination = null,
  initialDate = null,
  initialBaggage = false,
  initialAnimals = false,
  initialSort = "earliest"
} = {}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [departure, setDeparture] = useState(null);
  const [destination, setDestination] = useState(null);
  const [allTrajets, setAllTrajets] = useState([]);
  const [filteredTrajets, setFilteredTrajets] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("earliest");
  const [allowBaggage, setAllowBaggage] = useState(false);
  const [allowAnimals, setAllowAnimals] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [trajetsPerPage] = useState(3);
  const router = useRouter();

  // Calculer les trajets à afficher pour la page courante
  const indexOfLastTrajet = currentPage * trajetsPerPage;
  const indexOfFirstTrajet = indexOfLastTrajet - trajetsPerPage;
  const currentTrajets = filteredTrajets.slice(indexOfFirstTrajet, indexOfLastTrajet);
  const totalPages = Math.ceil(filteredTrajets.length / trajetsPerPage);

  // Réinitialiser la page courante quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTrajets]);

  // Appliquer les valeurs initiales à l'ouverture
  useEffect(() => {
    if (initialDeparture) {
      const found = canadianCities.find(c => c.value === initialDeparture);
      setDeparture(found || null);
    }
    if (initialDestination) {
      const found = canadianCities.find(c => c.value === initialDestination);
      setDestination(found || null);
    }
    if (initialDate) {
      setSelectedDate(new Date(initialDate));
    }
    setAllowBaggage(!!initialBaggage);
    setAllowAnimals(!!initialAnimals);
    setSelectedFilter(initialSort || "earliest");
  }, [initialDeparture, initialDestination, initialDate, initialBaggage, initialAnimals, initialSort]);

  // Lancer la recherche automatiquement si valeurs initiales
  useEffect(() => {
    if (initialDeparture || initialDestination || initialDate || initialBaggage || initialAnimals) {
      handleSearch();
    }
    // eslint-disable-next-line
  }, [departure, destination, selectedDate, allowBaggage, allowAnimals, selectedFilter, allTrajets]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/check-session", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.isAuthenticated) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Erreur auth:", error);
      }
    };

    const fetchTrajets = async () => {
      try {
        const res = await fetch("http://localhost:5000/trajets", {
          credentials: "include"
        });
        if (!res.ok) {
          throw new Error(`Erreur HTTP: ${res.status}`);
        }
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const validTrajets = data.filter(trajet => trajet && trajet.id && trajet.depart && trajet.destination && trajet.date);
        const sortedTrajets = [...validTrajets].sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllTrajets(sortedTrajets);
        setFilteredTrajets(sortedTrajets);
      } catch (err) {
        console.error("Erreur de chargement des trajets:", err);
      }
    };
    checkAuth();
    fetchTrajets();
  }, []);

  // SUPPRIMER le useEffect qui filtre dynamiquement
  // useEffect(() => {
  //   filterTrajets();
  // }, [departure, destination, selectedDate, selectedFilter, allowBaggage, allowAnimals, allTrajets]);

  // Nouvelle fonction appelée uniquement au clic sur le bouton
  const handleSearch = () => {
    let result = [...allTrajets];
    if (departure) {
      result = result.filter((t) => t.depart.toLowerCase() === departure.value.toLowerCase());
    }
    if (destination) {
      result = result.filter((t) => t.destination.toLowerCase() === destination.value.toLowerCase());
    }
    if (selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split("T")[0];
      result = result.filter((t) => {
        const trajetDate = new Date(t.date).toISOString().split("T")[0];
        return trajetDate === selectedDateStr;
      });
    }
    if (allowBaggage) {
      result = result.filter((t) => t.bagagesAcceptes === true);
    }
    if (allowAnimals) {
      result = result.filter((t) => t.animauxAcceptes === true);
    }
    if (selectedFilter === "earliest") {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (selectedFilter === "lowestPrice") {
      result.sort((a, b) => a.prix - b.prix);
    }
    setFilteredTrajets(result);
  };

  // Fonctions de pagination
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <section className="relative py-7 bg-white">
      <div className="flex flex-col px-6 md:px-12 xl:px-24">
        {/* Barre de recherche */}
        <div className="w-full mb-6 px-4 md:px-10">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xl flex flex-row items-center gap-4 w-full">
            {/* Départ */}
            <div className="flex items-center px-3 py-2 bg-white flex-1 shadow-md border border-gray-200 rounded-md">
              <SiGooglemaps className="text-gray-500 mr-2" />
              <Select
                options={canadianCities}
                value={departure}
                onChange={setDeparture}
                placeholder="Départ"
                styles={customSelectStyles}
                isClearable
              />
            </div>
            {/* Destination */}
            <div className="flex items-center px-3 py-2 bg-white flex-1 shadow-md border border-gray-200 rounded-md">
              <FaMapSigns className="text-gray-500 mr-2" />
              <Select
                options={canadianCities}
                value={destination}
                onChange={setDestination}
                placeholder="Destination"
                styles={customSelectStyles}
                isClearable
              />
            </div>
            {/* Date */}
            <div className="flex items-center px-3 py-2 bg-white flex-1 shadow-md border border-gray-200 rounded-md">
              <CiCalendarDate className="text-gray-500 mr-2" />
              <DatePicker
                selected={selectedDate}
                onChange={setSelectedDate}
                placeholderText="Date"
                className="w-full bg-transparent outline-none border-none"
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                isClearable
              />
            </div>
            {/* Bagages */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white shadow-md border border-gray-200 rounded-md">
              <MdLuggage className="text-gray-500" />
              <input
                type="checkbox"
                checked={allowBaggage}
                onChange={() => setAllowBaggage((v) => !v)}
                className="accent-blue-500"
              />
              <span className="text-gray-600 text-sm">Bagages</span>
            </div>
            {/* Animaux */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white shadow-md border border-gray-200 rounded-md">
              <FaDog className="text-gray-500" />
              <input
                type="checkbox"
                checked={allowAnimals}
                onChange={() => setAllowAnimals((v) => !v)}
                className="accent-blue-500"
              />
              <span className="text-gray-600 text-sm">Animaux</span>
            </div>
            {/* Bouton de recherche */}
            <button
              onClick={handleSearch}
              className="ml-2 px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
            >
              Rechercher
            </button>
          </div>
        </div>

        {/* Conteneur filtres + trajets */}
        <div className="flex flex-col lg:flex-row w-full px-4 md:px-10 gap-6">
          {/* Filtres */}
          <div className="lg:w-1/3 w-full p-6 bg-gray-100 rounded-lg shadow-md text-base">
            <h3 className="text-2xl font-bold mb-6">Filtres de recherche</h3>

            {/* Tri */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 text-xl mb-2">Trier par</h4>
              {[["Départ le plus tôt", "earliest"], ["Prix le plus bas", "lowestPrice"]].map(
                ([label, value], i) => (
                  <label key={i} className="flex items-center justify-between mb-3">
                    {label}
                    <div className="relative inline-block w-12 h-6">
                      <input
                        type="radio"
                        name="sort"
                        value={value}
                        checked={selectedFilter === value}
                        onChange={() => setSelectedFilter(value)}
                        className="sr-only peer"
                      />
                      <div className="block bg-gray-300 w-full h-full rounded-full peer-checked:bg-blue-700 transition" />
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-6" />
                    </div>
                  </label>
                )
              )}
            </div>

            {/* Bagages & animaux */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 text-xl mb-2">Équipements</h4>
              <label className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2">
                  <MdLuggage className="text-xl text-gray-600" />
                  Bagages autorisés
                </span>
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={allowBaggage}
                    onChange={() => setAllowBaggage(!allowBaggage)}
                  />
                  <div className="block bg-gray-300 w-full h-full rounded-full peer-checked:bg-green-600 transition" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-6" />
                </div>
              </label>
              <label className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FaDog className="text-xl text-gray-600" />
                  Animaux autorisés
                </span>
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={allowAnimals}
                    onChange={() => setAllowAnimals(!allowAnimals)}
                  />
                  <div className="block bg-gray-300 w-full h-full rounded-full peer-checked:bg-green-600 transition" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-6" />
                </div>
              </label>
            </div>
          </div>

          {/* Liste des trajets */}
          <div className="lg:w-2/3 w-full p-4">
            {filteredTrajets.length === 0 ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">⚠️</div>
                  <div className="ml-3">
                    <p className="text-yellow-700">
                      Aucun trajet ne correspond à vos critères.
                      {user && (
                        <Link href="/publier" className="ml-2 underline hover:text-yellow-800">
                          Publier un trajet ?
                        </Link>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Informations sur les résultats */}
                <div className="mb-4 text-sm text-gray-600">
                  {filteredTrajets.length} trajet{filteredTrajets.length > 1 ? 's' : ''} trouvé{filteredTrajets.length > 1 ? 's' : ''}
                  {totalPages > 1 && (
                    <span className="ml-2">
                      (page {currentPage} sur {totalPages})
                    </span>
                  )}
                </div>

                {/* Liste des trajets */}
                {currentTrajets.map((trajet, index) => {
                  const dateTrajet = new Date(trajet.date);
                  const dateFormatted = dateTrajet.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  // Calcul du nombre de places réservées
                  const placesReservees = Array.isArray(trajet.reservations)
                    ? trajet.reservations.reduce((total, r) => total + (r.nbPlaces || 0), 0)
                    : 0;
                  const placesDisponibles = trajet.places - placesReservees;
                  const isComplet = placesDisponibles <= 0;

                  return (
                    <div
                      key={trajet.id}
                      className="flex flex-col sm:flex-row items-center justify-between w-full bg-[#f7fafc] rounded-lg shadow-md p-4 my-2"
                    >
                      <div className="flex flex-col w-full">
                        <p className="text-xl font-semibold text-[#2d3748]">
                          {trajet.depart} → {trajet.destination}
                        </p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <CiCalendarDate className="mr-1 text-lg" />
                          <span>Départ: {dateFormatted}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <FaUsersLine className="mr-1 text-lg" />
                          <span className="flex items-center gap-1">
                            {Array.from({ length: trajet.places }).map((_, i) => (
                              <FaUser
                                key={i}
                                className={
                                  i < placesReservees
                                    ? "text-blue-500"
                                    : "text-gray-400"
                                }
                                title={i < placesReservees ? "Place réservée" : "Place libre"}
                              />
                            ))}
                            <span className="ml-2 text-xs">
                              {isComplet ? (
                                <span className="text-red-600 font-bold">Complet</span>
                              ) : (
                                <>
                                  {placesDisponibles} libre{placesDisponibles > 1 ? "s" : ""} / {trajet.places}
                                </>
                              )}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <span>Conducteur: {trajet.conducteur.nom}</span>
                        </div>
                        <div className="flex items-center mt-2 space-x-4">
                          {trajet.animauxAcceptes && <FaDog className="text-xl text-gray-600" title="Animaux acceptés" />}
                          {trajet.bagagesAcceptes && <MdLuggage className="text-xl text-gray-600" title="Bagages acceptés" />}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center items-center mt-4 sm:mt-0 sm:ml-4">
                        <p className="text-xl font-bold text-gray-600">{trajet.prix} $CA</p>
                        {isComplet ? (
                          <div className="bg-red-100 text-red-600 px-6 py-2 rounded-md mt-2 text-center font-semibold">
                            Complet
                          </div>
                        ) : trajet.conducteurId === user?.id ? (
                          <div className="bg-gray-200 text-gray-600 px-6 py-2 rounded-md mt-2 cursor-not-allowed text-center">
                            Votre trajet
                          </div>
                        ) : (
                          <a
                            href={`/trajetdetail/${trajet.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 text-white px-6 py-2 rounded-md mt-2 hover:bg-[#2f855a] transition-colors inline-block text-center"
                          >
                            Voir
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-6 space-x-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {getPageNumbers().map((pageNumber, index) => (
                      <button
                        key={index}
                        onClick={() => typeof pageNumber === 'number' ? goToPage(pageNumber) : null}
                        disabled={pageNumber === '...'}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          pageNumber === currentPage
                            ? 'bg-blue-600 text-white'
                            : pageNumber === '...'
                            ? 'text-gray-400 cursor-default'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

