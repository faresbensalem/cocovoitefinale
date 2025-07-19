"use client";

import { useState } from "react";
import { FaMapSigns } from "react-icons/fa";
import { SiGooglemaps } from "react-icons/si";
import { CiCalendarDate } from "react-icons/ci";
import { FaUsersLine } from "react-icons/fa6";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";

// Liste des villes canadiennes
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

// Styles personnalisés pour react-select
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

export default function Activites() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [departure, setDeparture] = useState(null);
  const [destination, setDestination] = useState(null);
  const router = useRouter();

  return (
    <section className="relative h-[700px] w-[90%] mx-auto overflow-hidden">
      {/* Vidéo en arrière-plan */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="/img/carland.mp4" // accès direct via dossier public
      />

      {/* Overlay sombre pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-opacity-40 z-10" />

      {/* Contenu (barre de recherche) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
    <h1 className="text-9xl font-bold text-white mb-2 uppercase">COCOVOIT</h1>
<p className="text-3xl text-white mb-6">UN AUTRE FAÇON DE VOYAGER</p>

        <div className="bg-white bg-opacity-90 p-4 rounded-xl shadow-md flex gap-4 items-center max-w-5xl w-full mx-4 flex-wrap">
          {/* Départ */}
          <div className="flex items-center rounded-md px-3 py-2 bg-white w-[250px]">
            <SiGooglemaps className="text-gray-500 mr-2" />
            <div className="w-full">
              <Select
                options={canadianCities}
                value={departure}
                onChange={setDeparture}
                placeholder="Départ"
                styles={customSelectStyles}
                classNamePrefix="react-select"
              />
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-center rounded-md px-3 py-2 bg-white w-[250px]">
            <FaMapSigns className="text-gray-500 mr-2" />
            <div className="w-full">
              <Select
                options={canadianCities}
                value={destination}
                onChange={setDestination}
                placeholder="Destination"
                styles={customSelectStyles}
                classNamePrefix="react-select"
              />
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center rounded-md px-3 py-2 bg-white w-[180px]">
            <CiCalendarDate className="text-gray-500 text-2xl mr-2" />
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Date"
              className="w-full focus:outline-none bg-transparent"
            />
          </div>

          {/* Passagers */}
          <div className="flex items-center rounded-md px-3 py-2 bg-white w-[100px]">
            <FaUsersLine className="text-gray-500 text-2xl mr-2" />
            <input
              type="number"
              placeholder="1"
              min={1}
              className="w-full focus:outline-none bg-transparent"
            />
          </div>

          {/* Bouton */}
          <button
            className="bg-[#258d83] text-white px-6 py-2 rounded-md hover:bg-[#30b5a9] transition-colors"
            onClick={() => {
              const params = new URLSearchParams();
              if (departure) params.append("departure", departure.value);
              if (destination) params.append("destination", destination.value);
              if (selectedDate) params.append("date", selectedDate.toISOString().split("T")[0]);
              router.push(`/recherche?${params.toString()}`);
            }}
          >
            Rechercher
          </button>
        </div>
      </div>
    </section>
  );
}
