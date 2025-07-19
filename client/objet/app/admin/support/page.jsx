"use client";
import React, { useState, useEffect } from "react";
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";

export default function Support() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/admin/contacts', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Contacts reçus:', data); // Debug
        setContacts(data);
      } else {
        const errorData = await response.json();
        console.error('Erreur réponse:', errorData); // Debug
        setError("Erreur lors du chargement des messages");
      }
    } catch (error) {
      console.error('Erreur fetch:', error); // Debug
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (contactId) => {
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}/read`, {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (response.ok) {
        setContacts(contacts.map(contact => 
          contact.id === contactId ? { ...contact, lu: true } : contact
        ));
        setSuccessMessage("Message marqué comme lu");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      setError("Erreur lors de la mise à jour");
    }
  };

  const deleteContact = async (contactId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;
    
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setContacts(contacts.filter(contact => contact.id !== contactId));
        setSuccessMessage("Message supprimé avec succès");
        setTimeout(() => setSuccessMessage(""), 3000);
        if (selectedContact?.id === contactId) {
          setSelectedContact(null);
        }
      }
    } catch (error) {
      setError("Erreur lors de la suppression");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaEnvelope className="text-blue-600" />
              Messages de Support
            </h1>
            <div className="text-sm text-gray-500">
              {contacts.length} message(s)
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          {contacts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FaEnvelope className="text-6xl mx-auto mb-4 text-gray-300" />
              <p className="text-xl">Aucun message de contact</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Liste des messages */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4">Messages</h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedContact?.id === contact.id
                            ? 'bg-blue-100 border-blue-300'
                            : contact.lu
                            ? 'bg-white border-gray-200'
                            : 'bg-yellow-50 border-yellow-200'
                        } border ${
                          !contact.lu ? 'border-l-4 border-l-yellow-500' : ''
                        }`}
                        onClick={() => setSelectedContact(contact)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {contact.lu ? (
                              <FaEnvelopeOpen className="text-gray-400" />
                            ) : (
                              <FaEnvelope className="text-yellow-500" />
                            )}
                            <span className={`font-medium ${!contact.lu ? 'text-yellow-700' : 'text-gray-700'}`}>
                              {contact.nom}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(contact.creeLe).split(' ')[0]}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1 truncate">
                          {contact.sujet}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Détails du message */}
              <div className="lg:col-span-2">
                {selectedContact ? (
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {selectedContact.sujet}
                      </h3>
                      <div className="flex gap-2">
                        {!selectedContact.lu && (
                          <button
                            onClick={() => markAsRead(selectedContact.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Marquer comme lu"
                          >
                            <FaEye />
                          </button>
                        )}
                        <button
                          onClick={() => deleteContact(selectedContact.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom
                          </label>
                          <p className="text-gray-900">{selectedContact.nom}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <p className="text-gray-900">{selectedContact.email}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date d'envoi
                        </label>
                        <p className="text-gray-900">{formatDate(selectedContact.creeLe)}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap">
                          {selectedContact.message}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Statut:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedContact.lu 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedContact.lu ? 'Lu' : 'Non lu'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border rounded-lg p-12 text-center text-gray-500">
                    <FaEnvelope className="text-6xl mx-auto mb-4 text-gray-300" />
                    <p>Sélectionnez un message pour voir les détails</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 