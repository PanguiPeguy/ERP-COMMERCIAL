"use client";

import { useEffect, useState } from "react";
import { livraisonsApi, commandesApi } from "@/lib/api";
import { Livraison, Commande } from "@/lib/types";
import { PlusCircle, Eye, Search, Truck } from "lucide-react";

const STATUTS: Record<string, string> = {
  PLANIFIEE: "badge-blue",
  EN_COURS:  "badge-yellow",
  LIVREE:    "badge-green",
};

export default function LivraisonsPage() {
  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCommandes, setSelectedCommandes] = useState<number[]>([]);

  const load = () => {
    setLoading(true);
    Promise.all([livraisonsApi.getAll(), commandesApi.getAll()])
      .then(([l, c]) => { setLivraisons(l); setCommandes(c); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const changeStatut = async (id: number, statut: string) => {
    await livraisonsApi.updateStatut(id, statut);
    load();
  };

  const createLivraison = async () => {
    if (selectedCommandes.length === 0) return;
    const details = selectedCommandes.flatMap(noCmd => {
      const cmd = commandes.find(c => c.noCommande === noCmd);
      return cmd ? [{ noCommande: noCmd, noArticle: 0, quantiteLivree: 1 }] : [];
    });
    await livraisonsApi.create({
      noLivraison: Date.now() % 100000,
      details,
    });
    setShowCreate(false);
    setSelectedCommandes([]);
    load();
  };

  const filtered = livraisons.filter(l =>
    String(l.noLivraison).includes(search) ||
    (l.statut || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Livraisons</h1>
          <p className="text-gray-500 text-sm">{livraisons.length} livraison(s)</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Nouvelle livraison
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
          placeholder="Rechercher une livraison..."
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
                  <th>No. Livraison</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.noLivraison}>
                    <td className="font-mono text-gray-500 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-green-600" />
                      #{l.noLivraison}
                    </td>
                    <td className="text-gray-500 text-xs">
                      {l.dateLivraison ? new Date(l.dateLivraison).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td>
                      <select
                        className={`badge ${STATUTS[l.statut] || "badge-gray"} border-0 bg-transparent cursor-pointer`}
                        value={l.statut}
                        onChange={e => changeStatut(l.noLivraison, e.target.value)}
                      >
                        {Object.keys(STATUTS).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">Aucune livraison</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold mb-4">Nouvelle livraison</h2>
            <p className="text-sm text-gray-500 mb-3">Sélectionnez les commandes à livrer :</p>
            <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
              {commandes.filter(c => c.statut === "EN_ATTENTE" || c.statut === "CONFIRMEE").map(c => (
                <label key={c.noCommande} className="flex items-center gap-3 text-sm cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedCommandes.includes(c.noCommande)}
                    onChange={e => {
                      if (e.target.checked) setSelectedCommandes([...selectedCommandes, c.noCommande]);
                      else setSelectedCommandes(selectedCommandes.filter(id => id !== c.noCommande));
                    }}
                    className="accent-green-600"
                  />
                  <span>Cmd #{c.noCommande} — {c.nomClient} — {Number(c.montantTotal).toFixed(2)} $</span>
                  <span className="badge badge-yellow ml-auto">{c.statut}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={createLivraison} className="btn-primary flex-1" disabled={selectedCommandes.length === 0}>
                Créer ({selectedCommandes.length} commande(s))
              </button>
              <button onClick={() => { setShowCreate(false); setSelectedCommandes([]); }} className="btn-secondary flex-1">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}