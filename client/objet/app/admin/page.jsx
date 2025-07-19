"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaUsers, FaCar, FaSignOutAlt, FaExclamationTriangle, FaTrash, FaBan, FaCheckCircle, FaEnvelope } from "react-icons/fa";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [trajets, setTrajets] = useState([]);
  const [section, setSection] = useState("users"); // 'users', 'trajets', 'signalisation'
  const [searchUser, setSearchUser] = useState("");
  const [searchTrajet, setSearchTrajet] = useState("");
  const [signaledUsers, setSignaledUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("http://localhost:5000/check-session", { credentials: "include" });
        const data = await res.json();
        if (!data.isAuthenticated || !data.user || data.user.type !== "ADMIN") {
          router.push("/connexion");
        } else {
          setUser(data.user);
        }
      } catch (e) {
        router.push("/connexion");
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    if (user && user.type === "ADMIN") {
      fetchUsers();
      fetchTrajets();
      fetchSignaledUsers();
      fetchContacts();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/users", { credentials: "include" });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Erreur chargement utilisateurs");
    }
  };

  const fetchTrajets = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/trajets", { credentials: "include" });
      const data = await res.json();
      setTrajets(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Erreur chargement trajets");
    }
  };

  const fetchSignaledUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/users", { credentials: "include" });
      const usersData = await res.json();
      // Pour chaque utilisateur, récupérer la moyenne des avis reçus
      const usersWithAvis = await Promise.all(usersData.map(async (u) => {
        const avisRes = await fetch(`http://localhost:5000/avis/conducteur/${u.id}`);
        const avisData = await avisRes.json();
        return { ...u, moyenneAvis: parseFloat(avisData.moyenne) };
      }));
      setSignaledUsers(usersWithAvis.filter(u => u.moyenneAvis > 0 && u.moyenneAvis < 2));
    } catch (e) {
      // ignore
    }
  };

  const handleLogout = async () => {
    await fetch("http://localhost:5000/logout", { method: "POST", credentials: "include" });
    window.location.href = "/connexion";
  };

  // Ajoute les handlers pour ban/déban et suppression trajet
  const handleBanUser = async (userId, banni) => {
    await fetch(`http://localhost:5000/admin/users/${userId}/ban`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ banni })
    });
    fetchUsers();
    fetchSignaledUsers();
  };
  const handleDeleteTrajet = async (trajetId) => {
    setError("");
    setSuccess("");
    const res = await fetch(`http://localhost:5000/admin/trajets/${trajetId}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur lors de la suppression du trajet");
    } else {
      setSuccess("Trajet supprimé avec succès !");
      fetchTrajets();
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/contacts", { credentials: "include" });
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Erreur chargement contacts:", e);
    }
  };

  const markContactAsRead = async (contactId) => {
    try {
      const res = await fetch(`http://localhost:5000/admin/contacts/${contactId}/read`, {
        method: "PATCH",
        credentials: "include"
      });
      if (res.ok) {
        setContacts(contacts.map(contact => 
          contact.id === contactId ? { ...contact, lu: true } : contact
        ));
        setSuccess("Message marqué comme lu");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (e) {
      setError("Erreur lors de la mise à jour");
    }
  };

  const deleteContact = async (contactId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/admin/contacts/${contactId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setContacts(contacts.filter(contact => contact.id !== contactId));
        setSuccess("Message supprimé avec succès");
        setTimeout(() => setSuccess(""), 3000);
        if (selectedContact?.id === contactId) {
          setSelectedContact(null);
        }
      }
    } catch (e) {
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

  if (!user || user.type !== "ADMIN") {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-white shadow-xl flex flex-col py-8 px-4">
        <div className="flex flex-col gap-8 flex-1">
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-lg transition-colors ${section === "users" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-blue-50"}`}
            onClick={() => setSection("users")}
          >
            <FaUsers className="text-2xl" />
            Utilisateurs
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-lg transition-colors ${section === "trajets" ? "bg-green-100 text-green-700" : "text-gray-700 hover:bg-green-50"}`}
            onClick={() => setSection("trajets")}
          >
            <FaCar className="text-2xl" />
            Trajets
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-lg transition-colors ${section === "signalisation" ? "bg-yellow-100 text-yellow-700" : "text-gray-700 hover:bg-yellow-50"}`}
            onClick={() => setSection("signalisation")}
          >
            <FaExclamationTriangle className="text-2xl" />
            Signalisation
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-lg transition-colors ${section === "support" ? "bg-purple-100 text-purple-700" : "text-gray-700 hover:bg-purple-50"}`}
            onClick={() => setSection("support")}
          >
            <FaEnvelope className="text-2xl" />
            Support
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition-colors mt-8"
        >
          <FaSignOutAlt className="text-xl" /> Déconnexion
        </button>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-10 overflow-auto">
        {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-4 mb-4 rounded">{success}</div>}
        {section === "users" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-blue-700 flex items-center gap-2"><FaUsers /> Utilisateurs</h2>
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="mb-4 px-4 py-2 border rounded w-full"
              value={searchUser}
              onChange={e => setSearchUser(e.target.value)}
            />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase">Avatar</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase">Nom</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase">Statut</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u =>
                    (u.nom && u.nom.toLowerCase().includes(searchUser.toLowerCase())) ||
                    (u.email && u.email.toLowerCase().includes(searchUser.toLowerCase()))
                  ).map(u => (
                    <tr key={u.id} className="hover:bg-blue-50 transition">
                      <td className="px-4 py-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                          {u.nom ? u.nom[0].toUpperCase() : u.email[0].toUpperCase()}
                        </div>
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-800">{u.nom || <span className='italic text-gray-400'>-</span>}</td>
                      <td className="px-4 py-2 text-gray-600">{u.email}</td>
                      <td className="px-4 py-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.type === 'ADMIN' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>{u.type}</span>
                      </td>
                      <td className="px-4 py-2">
                        {u.banni ? (
                          <span className="flex items-center gap-1 text-red-600 font-bold"><FaBan /> Banni</span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600 font-bold"><FaCheckCircle /> Actif</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {u.type !== 'ADMIN' && (
                          <button
                            onClick={() => handleBanUser(u.id, !u.banni)}
                            className={`px-3 py-1 rounded text-xs font-bold ${u.banni ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'} hover:opacity-80 mr-2`}
                          >
                            {u.banni ? 'Débannir' : 'Bannir'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {section === "trajets" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-green-700 flex items-center gap-2"><FaCar /> Trajets</h2>
            <input
              type="text"
              placeholder="Rechercher un trajet (départ, destination, conducteur)..."
              className="mb-4 px-4 py-2 border rounded w-full"
              value={searchTrajet}
              onChange={e => setSearchTrajet(e.target.value)}
            />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-green-100">
                <thead>
                  <tr className="bg-green-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-green-700 uppercase">Départ</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-green-700 uppercase">Destination</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-green-700 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-green-700 uppercase">Conducteur</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-green-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {trajets.filter(t =>
                    (t.depart && t.depart.toLowerCase().includes(searchTrajet.toLowerCase())) ||
                    (t.destination && t.destination.toLowerCase().includes(searchTrajet.toLowerCase())) ||
                    (t.conducteur && t.conducteur.nom && t.conducteur.nom.toLowerCase().includes(searchTrajet.toLowerCase()))
                  ).map(t => (
                    <tr key={t.id} className="hover:bg-green-50 transition">
                      <td className="px-4 py-2 font-medium text-gray-800">{t.depart}</td>
                      <td className="px-4 py-2 font-medium text-gray-800">{t.destination}</td>
                      <td className="px-4 py-2 text-gray-600">{new Date(t.date).toLocaleString("fr-FR")}</td>
                      <td className="px-4 py-2 text-gray-700">{t.conducteur?.nom || <span className='italic text-gray-400'>-</span>}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleDeleteTrajet(t.id)}
                          className="px-3 py-1 rounded text-xs font-bold bg-red-200 text-red-800 hover:opacity-80 flex items-center gap-1"
                        >
                          <FaTrash /> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {section === "signalisation" && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-yellow-700 flex items-center gap-2"><FaExclamationTriangle /> Comptes signalés (moins de 2 étoiles)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-yellow-100">
                <thead>
                  <tr className="bg-yellow-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-yellow-700 uppercase">Nom</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-yellow-700 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-yellow-700 uppercase">Moyenne avis</th>
                  </tr>
                </thead>
                <tbody>
                  {signaledUsers.map(u => (
                    <tr key={u.id} className="hover:bg-yellow-50 transition">
                      <td className="px-4 py-2 font-medium text-gray-800">{u.nom || <span className='italic text-gray-400'>-</span>}</td>
                      <td className="px-4 py-2 text-gray-600">{u.email}</td>
                      <td className="px-4 py-2 text-yellow-700 font-bold">{u.moyenneAvis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {section === "support" && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-purple-700 flex items-center gap-2"><FaEnvelope /> Messages de Support</h2>
            
            {contacts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center py-12 text-gray-500">
                  <FaEnvelope className="text-6xl mx-auto mb-4 text-gray-300" />
                  <p className="text-xl">Aucun message de contact</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Liste des messages */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Messages ({contacts.length})</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {contacts.map((contact) => (
                        <div
                          key={contact.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedContact?.id === contact.id
                              ? 'bg-purple-100 border-purple-300'
                              : contact.lu
                              ? 'bg-gray-50 border-gray-200'
                              : 'bg-yellow-50 border-yellow-200'
                          } border ${
                            !contact.lu ? 'border-l-4 border-l-yellow-500' : ''
                          }`}
                          onClick={() => setSelectedContact(contact)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {contact.lu ? (
                                <FaEnvelope className="text-gray-400" />
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
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {selectedContact.sujet}
                        </h3>
                        <div className="flex gap-2">
                          {!selectedContact.lu && (
                            <button
                              onClick={() => markContactAsRead(selectedContact.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Marquer comme lu"
                            >
                              <FaEnvelope />
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
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center text-gray-500">
                      <FaEnvelope className="text-6xl mx-auto mb-4 text-gray-300" />
                      <p>Sélectionnez un message pour voir les détails</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 