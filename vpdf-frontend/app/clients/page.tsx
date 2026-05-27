"use client";

import { useEffect, useState } from "react";
import { clientsApi } from "@/lib/api";
import { Client } from "@/lib/types";
import { UserPlus, Pencil, Trash2, Search } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; client?: Client }>({ open: false });
  const [form, setForm] = useState({ noClient: 0, nomClient: "", noTelephone: "" });

  const load = () => {
    setLoading(true);
    clientsApi.getAll()
      .then(setClients)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ noClient: Date.now() % 100000, nomClient: "", noTelephone: "" });
    setModal({ open: true });
  };

  const openEdit = (c: Client) => {
    setForm({ noClient: c.noClient, nomClient: c.nomClient, noTelephone: c.noTelephone });
    setModal({ open: true, client: c });
  };

  const save = async () => {
    if (modal.client) {
      await clientsApi.update(modal.client.noClient, form);
    } else {
      await clientsApi.create(form);
    }
    setModal({ open: false });
    load();
  };

  const remove = async (id: number) => {
    if (confirm("Supprimer ce client ?")) {
      await clientsApi.delete(id);
      load();
    }
  };

  const filtered = clients.filter(c =>
    c.nomClient?.toLowerCase().includes(search.toLowerCase()) ||
    c.noTelephone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-gray-500 text-sm">{clients.length} client(s) enregistré(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Nouveau client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Rechercher un client..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Nom</th>
                  <th>Téléphone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.noClient}>
                    <td className="text-gray-400 font-mono">#{c.noClient}</td>
                    <td className="font-medium">{c.nomClient}</td>
                    <td>{c.noTelephone}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(c.noClient)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">Aucun client trouvé</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-4">
              {modal.client ? "Modifier le client" : "Nouveau client"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">No. Client</label>
                <input
                  type="number"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.noClient}
                  onChange={e => setForm({ ...form, noClient: +e.target.value })}
                  disabled={!!modal.client}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nom complet</label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.nomClient}
                  onChange={e => setForm({ ...form, nomClient: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.noTelephone}
                  onChange={e => setForm({ ...form, noTelephone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} className="btn-primary flex-1">Enregistrer</button>
              <button onClick={() => setModal({ open: false })} className="btn-secondary flex-1">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}