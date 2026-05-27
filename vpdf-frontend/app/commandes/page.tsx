"use client";

import { useEffect, useState } from "react";
import { commandesApi } from "@/lib/api";
import { Commande } from "@/lib/types";
import { PlusCircle, Eye, Trash2, Search } from "lucide-react";
import Link from "next/link";

const STATUTS: Record<string, string> = {
  EN_ATTENTE: "badge-yellow",
  CONFIRMEE:  "badge-blue",
  LIVREE:     "badge-green",
  ANNULEE:    "badge-red",
};

export default function CommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Commande | null>(null);

  const load = () => {
    setLoading(true);
    commandesApi.getAll()
      .then(setCommandes)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: number) => {
    if (confirm("Supprimer cette commande ?")) {
      await commandesApi.delete(id);
      load();
    }
  };

  const changeStatut = async (id: number, statut: string) => {
    await commandesApi.updateStatut(id, statut);
    load();
  };

  const filtered = commandes.filter(c =>
    c.nomClient?.toLowerCase().includes(search.toLowerCase()) ||
    String(c.noCommande).includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Commandes</h1>
          <p className="text-gray-500 text-sm">{commandes.length} commande(s)</p>
        </div>
        <Link href="/commandes/new" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Nouvelle commande
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
          placeholder="Rechercher par client ou numéro..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

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
                  <th>No. Commande</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Montant</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.noCommande}>
                    <td className="font-mono text-gray-500">#{c.noCommande}</td>
                    <td className="font-medium">{c.nomClient}</td>
                    <td className="text-gray-500 text-xs">
                      {c.dateCommande ? new Date(c.dateCommande).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td>
                      <select
                        className={`badge ${STATUTS[c.statut] || "badge-gray"} border-0 bg-transparent cursor-pointer`}
                        value={c.statut}
                        onChange={e => changeStatut(c.noCommande, e.target.value)}
                      >
                        {Object.keys(STATUTS).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="font-semibold text-green-700">
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "CAD" })
                        .format(Number(c.montantTotal))}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(c)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(c.noCommande)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Aucune commande</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Info Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-4">Commande #{selected.noCommande}</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Client</dt>
                <dd className="font-medium">{selected.nomClient}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Date</dt>
                <dd>{selected.dateCommande ? new Date(selected.dateCommande).toLocaleDateString("fr-FR") : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Statut</dt>
                <dd><span className={`badge ${STATUTS[selected.statut] || "badge-gray"}`}>{selected.statut}</span></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Montant total</dt>
                <dd className="font-bold text-green-700">
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "CAD" })
                    .format(Number(selected.montantTotal))}
                </dd>
              </div>
            </dl>
            <button onClick={() => setSelected(null)} className="btn-secondary w-full mt-5">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}