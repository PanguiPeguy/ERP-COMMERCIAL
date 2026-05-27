"use client";

import { useEffect, useState } from "react";
import { clientsApi, articlesApi, commandesApi } from "@/lib/api";
import { Client, Article } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, ShoppingCart } from "lucide-react";

interface Ligne {
  noArticle: number;
  quantite: number;
  article?: Article;
}

export default function NewCommandePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [noClient, setNoClient] = useState<number>(0);
  const [lignes, setLignes] = useState<Ligne[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([clientsApi.getAll(), articlesApi.getAll()])
      .then(([c, a]) => { setClients(c); setArticles(a); });
  }, []);

  const addLigne = () => setLignes([...lignes, { noArticle: 0, quantite: 1 }]);

  const updateLigne = (i: number, key: keyof Ligne, value: any) => {
    const updated = [...lignes];
    if (key === "noArticle") {
      updated[i] = {
        ...updated[i],
        noArticle: +value,
        article: articles.find(a => a.noArticle === +value)
      };
    } else {
      updated[i] = { ...updated[i], [key]: value };
    }
    setLignes(updated);
  };

  const removeLigne = (i: number) => setLignes(lignes.filter((_, idx) => idx !== i));

  const total = lignes.reduce((acc, l) => {
    const prix = l.article?.prixUnitaire || 0;
    return acc + prix * (l.quantite || 0);
  }, 0);

  const submit = async () => {
    setError("");
    if (!noClient) { setError("Veuillez sélectionner un client."); return; }
    if (lignes.length === 0) { setError("Ajoutez au moins une ligne."); return; }
    if (lignes.some(l => !l.noArticle)) { setError("Sélectionnez un article pour chaque ligne."); return; }

    setSaving(true);
    try {
      await commandesApi.create({
        noCommande: Date.now() % 1000000,
        noClient,
        lignes: lignes.map(l => ({ noArticle: l.noArticle, quantite: l.quantite }))
      });
      router.push("/commandes");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Erreur lors de la création. Stock insuffisant ?");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Nouvelle commande</h1>
          <p className="text-gray-500 text-sm">Créer une commande client</p>
        </div>
      </div>

      {/* Client */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold mb-3">Client</h2>
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm"
          value={noClient}
          onChange={e => setNoClient(+e.target.value)}
        >
          <option value={0}>-- Sélectionner un client --</option>
          {clients.map(c => (
            <option key={c.noClient} value={c.noClient}>
              #{c.noClient} — {c.nomClient}
            </option>
          ))}
        </select>
      </div>

      {/* Lignes */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Articles commandés</h2>
          <button onClick={addLigne} className="btn-secondary flex items-center gap-2 text-xs">
            <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
          </button>
        </div>

        {lignes.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Aucune ligne — cliquez sur "Ajouter une ligne"
          </div>
        )}

        <div className="space-y-3">
          {lignes.map((l, i) => (
            <div key={i} className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg">
              <select
                className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white"
                value={l.noArticle}
                onChange={e => updateLigne(i, "noArticle", e.target.value)}
              >
                <option value={0}>-- Article --</option>
                {articles.map(a => (
                  <option key={a.noArticle} value={a.noArticle}>
                    {a.description} (stock: {a.quantiteEnStock}) — {a.prixUnitaire}$
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                className="w-20 border rounded-lg px-3 py-2 text-sm"
                value={l.quantite}
                onChange={e => updateLigne(i, "quantite", +e.target.value)}
              />
              <div className="text-sm font-semibold text-green-700 w-24 text-right">
                {((l.article?.prixUnitaire || 0) * l.quantite).toFixed(2)} $
              </div>
              <button onClick={() => removeLigne(i)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {lignes.length > 0 && (
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="text-xl font-bold text-green-700">{total.toFixed(2)} $</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={submit}
          disabled={saving}
          className="btn-primary flex items-center gap-2 flex-1 justify-center"
        >
          <ShoppingCart className="w-4 h-4" />
          {saving ? "Création..." : "Créer la commande"}
        </button>
        <button onClick={() => router.back()} className="btn-secondary flex-1">
          Annuler
        </button>
      </div>
    </div>
  );
}