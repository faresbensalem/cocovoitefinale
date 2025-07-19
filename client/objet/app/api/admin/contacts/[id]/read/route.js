import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    
    const response = await fetch(`http://localhost:5000/admin/contacts/${id}/read`, {
      method: 'PATCH',
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
        { error: data.error || "Erreur lors de la mise à jour du message" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Erreur API admin contact read:', error);
    return NextResponse.json(
      { error: "Erreur de connexion au serveur" },
      { status: 500 }
    );
  }
} 