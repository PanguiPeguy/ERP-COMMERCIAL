"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { DashboardStats } from "@/lib/types";
import StatCard from "@/components/StatCard";
import {
  Users, Package, ShoppingCart, Truck, TrendingUp
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
                "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1"];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  const ca = stats?.chiffreAffaires
    ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "CAD" })
        .format(Number(stats.chiffreAffaires))
    : "—";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d\'ensemble de l\'activité commerciale</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Clients"
          value={stats?.totalClients ?? 0}
          subtitle="clients enregistrés"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Articles en stock"
          value={stats?.totalArticles ?? 0}
          subtitle="références actives"
          icon={Package}
          color="green"
        />
        <StatCard
          title="Commandes"
          value={stats?.totalCommandes ?? 0}
          subtitle="total cumulé"
          icon={ShoppingCart}
          color="purple"
        />
        <StatCard
          title="Livraisons"
          value={stats?.totalLivraisons ?? 0}
          subtitle="total effectuées"
          icon={Truck}
          color="orange"
        />
      </div>

      {/* Chiffre d\'affaires banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 opacity-80" />
          <div>
            <p className="text-green-100 text-sm font-medium">Chiffre d\'affaires total</p>
            <p className="text-3xl font-bold">{ca}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue par mois */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold mb-4">Revenus par mois</h2>
          {stats?.revenueParMois && stats.revenueParMois.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.revenueParMois}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) =>
                    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "CAD" }).format(v)}
                />
                <Bar dataKey="montant" fill="#22c55e" radius={[4, 4, 0, 0]} name="Revenus" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Top articles */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold mb-4">Top articles vendus</h2>
          {stats?.topArticles && stats.topArticles.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.topArticles.slice(0, 8)}
                  dataKey="quantiteVendue"
                  nameKey="description"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ description, percent }) =>
                    `${description?.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.topArticles.slice(0, 8).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} unités`, "Vendus"]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      {/* Top articles table */}
      {stats?.topArticles && stats.topArticles.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b">
            <h2 className="text-base font-semibold">Classement des articles</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Article</th>
                  <th>Qté vendue</th>
                  <th>Chiffre d\'affaires</th>
                </tr>
              </thead>
              <tbody>
                {stats.topArticles.slice(0, 10).map((a, i) => (
                  <tr key={a.noArticle}>
                    <td>
                      <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs
                                       font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                    </td>
                    <td className="font-medium">{a.description}</td>
                    <td>{a.quantiteVendue}</td>
                    <td>
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "CAD" })
                        .format(Number(a.chiffreAffaires))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}