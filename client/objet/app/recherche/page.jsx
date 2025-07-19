"use client";
import Recherche from "../../components/home/recherche";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function RecherchePage() {
  const searchParams = useSearchParams();

  // Récupérer les paramètres de l'URL
  const departure = searchParams.get("departure") || null;
  const destination = searchParams.get("destination") || null;
  const date = searchParams.get("date") || null;
  const baggage = searchParams.get("baggage") === "1";
  const animals = searchParams.get("animals") === "1";
  const sort = searchParams.get("sort") || "earliest";

  return (
    <Recherche
      initialDeparture={departure}
      initialDestination={destination}
      initialDate={date}
      initialBaggage={baggage}
      initialAnimals={animals}
      initialSort={sort}
    />
  );
} 