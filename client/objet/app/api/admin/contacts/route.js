import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const response = await fetch('http://localhost:5000/admin/contacts', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { error: data.error || "Erreur lors de la récupération des messages" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Erreur API admin contacts:', error);
    return NextResponse.json(
      { error: "Erreur de connexion au serveur" },
      { status: 500 }
    );
  }
} 