"use client";
import { useState, useEffect } from "react";
import { FaMapSigns } from "react-icons/fa";
import { SiGooglemaps } from "react-icons/si";
import { CiCalendarDate } from "react-icons/ci";
import { FaUsersLine } from "react-icons/fa6";
import { MdLuggage } from "react-icons/md";
import { FaDog } from "react-icons/fa";
import DatePicker from "react-datepicker";
import Select from "react-select";
import Link from "next/link";
import "react-datepicker/dist/react-datepicker.css";

const canadianCities = [
  { value: "Toronto", label: "Toronto" },
  { value: "Montréal", label: "Montréal" },
  { value: "Vancouver", label: "Vancouver" },
  { value: "Calgary", label: "Calgary" },
  { value: "Ottawa", label: "Ottawa" },
  { value: "Edmonton", label: "Edmonton" },
  { value: "Québec", label: "Québec" },
  { value: "Winnipeg", label: "Winnipeg" },
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

export default function Recherche() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [departure, setDeparture] = useState(null);
  const [destination, setDestination] = useState(null);
  const [allTrajets, setAllTrajets] = useState([]);
  const [filteredTrajets, setFilteredTrajets] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("earliest");
  const [allowBaggage, setAllowBaggage] = useState(false);
  const [allowAnimals, setAllowAnimals] = useState(false);

  useEffect(() => {
    const fetchTrajets = async () => {
      try {
        const res = await fetch("http://localhost:5000/trajets");
        const data = await res.json();
        setAllTrajets(data);
        setFilteredTrajets(data);
      } catch (err) {
        console.error("Erreur de chargement des trajets :", err);
      }
    };
    fetchTrajets();
  }, []);

  useEffect(() => {
    filterTrajets();
  }, [departure, destination, selectedDate, selectedFilter, allowBaggage, allowAnimals]);

  const filterTrajets = () => {
    let result = [...allTrajets];

    if (departure) {
      result = result.filter((t) => t.depart === departure.value);
    }

    if (destination) {
      result = result.filter((t) => t.destination === destination.value);
    }

    if (selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split("T")[0];
      result = result.filter((t) => t.date.startsWith(selectedDateStr));
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
                className="w-full"
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
                className="w-full"
              />
            </div>

            {/* Date */}
            <div className="flex items-center px-3 py-2 bg-white flex-[0.8] shadow-md border border-gray-200 rounded-md">
              <CiCalendarDate className="text-gray-500 text-2xl mr-2" />
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Date"
                className="w-full focus:outline-none bg-transparent"
              />
            </div>

            {/* Passagers (non utilisé dans filtrage) */}
            <div className="flex items-center px-3 py-2 bg-white flex-[0.6] shadow-md border border-gray-200 rounded-md">
              <FaUsersLine className="text-gray-500 text-2xl mr-2" />
              <input
                type="number"
                placeholder="1"
                min={1}
                className="w-full focus:outline-none bg-transparent"
              />
            </div>

            {/* Bouton recherche (optionnel ici) */}
            <button
              className="bg-blue-700 text-white px-6 py-2 rounded-md hover:bg-[#63b3ed] transition-colors shadow-lg flex-[0.7] whitespace-nowrap"
              onClick={filterTrajets}
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
            {filteredTrajets.map((trajet, index) => {
              const dateSimple = new Date(trajet.date).toISOString().split("T")[0];
              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-center justify-between w-full bg-[#f7fafc] rounded-lg shadow-md p-4 my-2"
                >
                  <div className="flex flex-col w-full">
                    <p className="text-xl font-semibold text-[#2d3748]">
                      {trajet.depart} → {trajet.destination}
                    </p>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <CiCalendarDate className="mr-1 text-lg" />
                      <span>Départ: {dateSimple}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <FaUsersLine className="mr-1 text-lg" />
                      <span>Places: {trajet.places}</span>
                    </div>
                    <div className="flex items-center mt-2 space-x-4">
                      {trajet.animauxAcceptes && <FaDog className="text-xl text-gray-600" />}
                      {trajet.bagagesAcceptes && <MdLuggage className="text-xl text-gray-600" />}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-center mt-4 sm:mt-0 sm:ml-4">
                    <p className="text-xl font-bold text-gray-600">{trajet.prix} $</p>
              <a
  href={`/trajetdetail/${trajet.id}`}
  target="_blank"
  rel="noopener noreferrer"
  className="bg-green-600 text-white px-6 py-2 rounded-md mt-2 hover:bg-[#2f855a] transition-colors inline-block text-center"
>
  Voir
</a>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
