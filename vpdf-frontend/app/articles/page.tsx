"use client";

import { useEffect, useState } from "react";
import { articlesApi } from "@/lib/api";
import { Article } from "@/lib/types";
import { PackagePlus, Pencil, Trash2, Search, AlertTriangle } from "lucide-react";

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) return <span className="badge badge-red">Rupture</span>;
  if (qty < 5)  return <span className="badge badge-yellow">{qty} restants</span>;
  return <span className="badge badge-green">{qty} en stock</span>;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; article?: Article }>({ open: false });
  const [form, setForm] = useState({
    noArticle: 0, description: "", prixUnitaire: 0,
    quantiteEnStock: 0, categorie: ""
  });

  const load = () => {
    setLoading(true);
    articlesApi.getAll()
      .then(setArticles)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ noArticle: Date.now() % 100000, description: "", prixUnitaire: 0, quantiteEnStock: 0, categorie: "" });
    setModal({ open: true });
  };

  const openEdit = (a: Article) => {
    setForm({ noArticle: a.noArticle, description: a.description, prixUnitaire: a.prixUnitaire, quantiteEnStock: a.quantiteEnStock, categorie: a.categorie || "" });
    setModal({ open: true, article: a });
  };

  const save = async () => {
    if (modal.article) {
      await articlesApi.update(modal.article.noArticle, form);
    } else {
      await articlesApi.create(form);
    }
    setModal({ open: false });
    load();
  };

  const remove = async (id: number) => {
    if (confirm("Supprimer cet article ?")) {
      await articlesApi.delete(id);
      load();
    }
  };

  const filtered = articles.filter(a =>
    a.description?.toLowerCase().includes(search.toLowerCase()) ||
    a.categorie?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = articles.filter(a => (a.quantiteEnStock || 0) < 5).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Articles & Stock</h1>
          <p className="text-gray-500 text-sm">{articles.length} article(s) référencé(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PackagePlus className="w-4 h-4" /> Nouvel article
        </button>
      </div>

      {/* Alert stock faible */}
      {lowStock > 0 && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
          <span><strong>{lowStock} article(s)</strong> ont un stock faible (moins de 5 unités)</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
          placeholder="Rechercher un article..."
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
                  <th>Description</th>
                  <th>Catégorie</th>
                  <th>Prix unitaire</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.noArticle}>
                    <td className="text-gray-400 font-mono">#{a.noArticle}</td>
                    <td className="font-medium">{a.description}</td>
                    <td><span className="badge badge-blue">{a.categorie || "—"}</span></td>
                    <td className="font-semibold text-green-700">
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "CAD" })
                        .format(Number(a.prixUnitaire))}
                    </td>
                    <td><StockBadge qty={a.quantiteEnStock} /></td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(a)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => remove(a.noArticle)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Aucun article trouvé</td></tr>
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
              {modal.article ? "Modifier l\'article" : "Nouvel article"}
            </h2>
            <div className="space-y-3">
              {[
                { label: "No. Article", key: "noArticle", type: "number" },
                { label: "Description", key: "description", type: "text" },
                { label: "Prix unitaire (CAD)", key: "prixUnitaire", type: "number" },
                { label: "Quantité en stock", key: "quantiteEnStock", type: "number" },
                { label: "Catégorie", key: "categorie", type: "text" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium text-gray-700">{f.label}</label>
                  <input
                    type={f.type}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    value={(form as any)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: f.type === "number" ? +e.target.value : e.target.value })}
                    disabled={f.key === "noArticle" && !!modal.article}
                  />
                </div>
              ))}
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