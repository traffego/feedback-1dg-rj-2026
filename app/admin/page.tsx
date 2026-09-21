"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  Lock,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  ArrowLeft,
  AlertTriangle,
  MessageSquareHeart,
  Filter,
  Copy,
  CheckCircle2,
  Trash2,
  CheckSquare,
  Square,
  X,
} from "lucide-react";
import Link from "next/link";

interface Feedback {
  id: string;
  positivo: string;
  melhorar: string;
  team: string;
  created_at: string;
}

const TEAMS = [
  "CRTV",
  "ACOLHIDA",
  "KIDS",
  "AeB",
  "RAHAMIM",
  "TÉCNICA",
  "LITURGIA",
  "SPACE",
  "CLEAN UP",
  "CHECK IN",
  "PROD",
  "VOLUNTARIADO",
  "ANASTASIS",
  "MONTAGEM | DESMONTAGEM",
  "ARTES",
  "STORE",
  "CENOGRAFIA",
] as const;

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [reportCopied, setReportCopied] = useState(false);

  // Delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmSingleId, setDeleteConfirmSingleId] = useState<
    string | null
  >(null);
  const [deleteConfirmBatch, setDeleteConfirmBatch] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/check");
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (err) {
      console.error("Erro ao buscar feedbacks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchFeedbacks();
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmittingAuth(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        setPasswordInput("");
      } else {
        const data = await res.json().catch(() => ({}));
        setAuthError(data.error || "Senha incorreta.");
      }
    } catch {
      setAuthError("Erro de conexão.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    setIsAuthenticated(false);
    setPasswordInput("");
  };

  // Delete individual
  const deleteSingle = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("feedbacks").delete().eq("id", id);
      if (error) throw error;

      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setDeleteConfirmSingleId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Erro ao excluir:", msg);
      alert("Erro ao excluir: " + msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete batch
  const deleteBatch = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase
        .from("feedbacks")
        .delete()
        .in("id", ids);
      if (error) throw error;

      setFeedbacks((prev) => prev.filter((f) => !selectedIds.has(f.id)));
      setSelectedIds(new Set());
      setDeleteConfirmBatch(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Erro ao excluir lote:", msg);
      alert("Erro ao excluir lote: " + msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredFeedbacks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFeedbacks.map((f) => f.id)));
    }
  };

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => {
      const matchesTeam = teamFilter === "all" || f.team === teamFilter;
      const matchesSearch =
        !searchTerm ||
        f.positivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.melhorar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.team.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTeam && matchesSearch;
    });
  }, [feedbacks, teamFilter, searchTerm]);

  const teamCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    feedbacks.forEach((f) => {
      counts[f.team] = (counts[f.team] || 0) + 1;
    });
    return counts;
  }, [feedbacks]);

  const copySummaryReport = () => {
    let report = `📋 *FEEDBACKS — CONF 1DG*\n`;
    report += `📅 Exportado em: ${new Date().toLocaleString("pt-BR")}\n`;
    report += `📝 Total: ${feedbacks.length} respostas\n\n`;

    const grouped: Record<string, Feedback[]> = {};
    feedbacks.forEach((f) => {
      if (!grouped[f.team]) grouped[f.team] = [];
      grouped[f.team].push(f);
    });

    Object.keys(grouped)
      .sort()
      .forEach((team) => {
        report += `--- *${team}* (${grouped[team].length}) ---\n`;
        grouped[team].forEach((f, i) => {
          report += `${i + 1}. ✅ Positivo: ${f.positivo}\n`;
          report += `   🔧 Melhorar: ${f.melhorar}\n\n`;
        });
      });

    navigator.clipboard.writeText(report);
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 3000);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4eee3]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#264639]" />
      </div>
    );
  }

  // Login
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#f4eee3]">
        <div className="max-w-md w-full rounded-xl border border-[#ded5c2] bg-[#fcf9f2] shadow-md">
          <div className="p-6 text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-[#264639] text-[#f4eee3] flex items-center justify-center mb-1 shadow-sm">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-[#1c3028]">
              Painel de Feedbacks
            </h2>
            <p className="text-sm text-[#507765]">
              Conf 1DG • Colo de Deus RJ
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="px-6 pb-2 space-y-4">
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              <input
                type="password"
                placeholder="Digite a senha de administrador"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
                required
                className="flex h-10 w-full rounded-lg border border-[#ded5c2] bg-white px-3 py-2 text-sm text-[#1c3028] placeholder:text-[#8a9890] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#264639] focus-visible:border-transparent transition-colors shadow-2xs"
              />
            </div>
            <div className="p-6 pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="inline-flex items-center justify-center rounded-lg w-full bg-[#264639] hover:bg-[#1b3329] text-[#f4eee3] font-black h-10 text-sm px-6 shadow-md cursor-pointer transition-colors disabled:opacity-50"
              >
                {isSubmittingAuth ? "Entrando..." : "Entrar no Painel"}
              </button>
              <Link
                href="/"
                className="text-xs text-[#507765] hover:text-[#1c3028] flex items-center justify-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar para o formulário
              </Link>
            </div>
          </form>
        </div>
      </main>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-[#f4eee3] flex flex-col">
      {/* Navbar */}
      <header className="bg-[#fcf9f2] border-b border-[#ded5c2] sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-[#507765] hover:text-[#1c3028] text-xs flex items-center gap-1 border border-[#ded5c2] bg-[#f4eee3] px-2.5 py-1.5 rounded-lg transition-colors font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Formulário</span>
            </Link>
            <div className="h-4 w-px bg-[#ded5c2]" />
            <div>
              <h1 className="text-base font-black text-[#1c3028] leading-none flex items-center gap-1.5 uppercase tracking-tight">
                <ShieldCheck className="w-4 h-4 text-[#264639]" />
                Feedbacks 1DG
              </h1>
              <p className="text-[11px] text-[#507765] font-semibold mt-0.5">
                Conf Um Dia de Glória • Colo de Deus RJ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchFeedbacks}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg border border-[#ded5c2] bg-white hover:bg-[#f4eee3] text-[#1c3028] font-bold h-9 px-3 text-xs gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              onClick={copySummaryReport}
              className="inline-flex items-center justify-center rounded-lg border border-[#ded5c2] bg-white hover:bg-[#f4eee3] text-[#1c3028] font-bold h-9 px-3 text-xs gap-1.5 cursor-pointer transition-colors"
            >
              {reportCopied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1f583e]" />
                  <span className="hidden sm:inline">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copiar Relatório</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-lg text-xs text-[#8f2d22] hover:bg-red-50 font-bold h-9 px-3 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-[#ded5c2] bg-[#fcf9f2] p-4 sm:p-5">
            <div className="flex items-center justify-between text-[#507765] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Total
              </span>
              <MessageSquareHeart className="w-4 h-4 text-[#264639]" />
            </div>
            <div className="text-2xl font-black text-[#1c3028]">
              {feedbacks.length}
            </div>
            <p className="text-xs text-[#507765] mt-1">feedbacks recebidos</p>
          </div>

          <div className="rounded-xl border border-[#ded5c2] bg-[#fcf9f2] p-4 sm:p-5">
            <div className="flex items-center justify-between text-[#507765] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Teams
              </span>
              <Filter className="w-4 h-4 text-[#264639]" />
            </div>
            <div className="text-2xl font-black text-[#1c3028]">
              {Object.keys(teamCounts).length}
            </div>
            <p className="text-xs text-[#507765] mt-1">teams com respostas</p>
          </div>

          <div className="rounded-xl border border-[#ded5c2] bg-[#fcf9f2] p-4 sm:p-5 col-span-2">
            <div className="flex items-center justify-between text-[#507765] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Por Team
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(teamCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([team, count]) => (
                  <button
                    key={team}
                    onClick={() =>
                      setTeamFilter(teamFilter === team ? "all" : team)
                    }
                    className={`text-[10px] font-bold px-2 py-1 rounded-md border cursor-pointer transition-colors ${
                      teamFilter === team
                        ? "bg-[#264639] text-[#f4eee3] border-[#264639]"
                        : "bg-white text-[#1c3028] border-[#ded5c2] hover:bg-[#f4eee3]"
                    }`}
                  >
                    {team} ({count})
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Barra flutuante de seleção em lote */}
        {selectedIds.size > 0 && (
          <div className="sticky top-20 z-30 bg-[#264639] text-[#f4eee3] p-4 rounded-xl shadow-lg border border-[#1a3328] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#f4eee3]" />
              <span className="text-sm font-bold">
                {selectedIds.size}{" "}
                {selectedIds.size === 1
                  ? "feedback selecionado"
                  : "feedbacks selecionados"}
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="inline-flex items-center justify-center rounded-lg text-xs h-9 px-3 bg-transparent text-[#f4eee3] border border-white/30 hover:bg-white/10 font-bold cursor-pointer transition-colors"
              >
                Desmarcar
              </button>
              <button
                onClick={() => setDeleteConfirmBatch(true)}
                disabled={isDeleting}
                className="inline-flex items-center justify-center rounded-lg text-xs h-9 px-3 bg-red-600 hover:bg-red-700 text-white font-bold gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Deletar {selectedIds.size}
              </button>
            </div>
          </div>
        )}

        {/* Modal confirmação batch */}
        {deleteConfirmBatch && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="max-w-md w-full rounded-xl border border-red-200 bg-[#fcf9f2] shadow-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1c3028]">
                    Excluir {selectedIds.size} feedbacks?
                  </h3>
                  <p className="text-xs text-[#507765]">
                    Ação permanente e irreversível.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmBatch(false)}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center rounded-lg text-xs h-9 px-4 border border-[#ded5c2] bg-white hover:bg-[#f4eee3] text-[#1c3028] font-bold cursor-pointer transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteBatch}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center rounded-lg text-xs h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-bold gap-1 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Excluindo..." : "Sim, Excluir"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal confirmação individual */}
        {deleteConfirmSingleId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="max-w-md w-full rounded-xl border border-red-200 bg-[#fcf9f2] shadow-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1c3028]">
                    Excluir este feedback?
                  </h3>
                  <p className="text-xs text-[#507765]">
                    Ação permanente e irreversível.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmSingleId(null)}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center rounded-lg text-xs h-9 px-4 border border-[#ded5c2] bg-white hover:bg-[#f4eee3] text-[#1c3028] font-bold cursor-pointer transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => deleteSingle(deleteConfirmSingleId)}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center rounded-lg text-xs h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-bold gap-1 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="rounded-xl border border-[#ded5c2] bg-[#fcf9f2] shadow-2xs">
          <div className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#8a9890] absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar nos feedbacks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-[#ded5c2] bg-white pl-9 pr-3 py-2 text-sm text-[#1c3028] placeholder:text-[#8a9890] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#264639] focus-visible:border-transparent transition-colors shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {filteredFeedbacks.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="inline-flex items-center justify-center rounded-lg border border-[#ded5c2] bg-white hover:bg-[#f4eee3] text-[#1c3028] font-bold h-10 px-3 text-xs gap-1.5 cursor-pointer transition-colors"
                >
                  {selectedIds.size === filteredFeedbacks.length ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Desmarcar</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Selecionar</span>
                    </>
                  )}
                </button>
              )}

              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="flex h-10 w-full sm:w-52 rounded-lg border border-[#ded5c2] bg-white px-3 py-2 text-sm text-[#1c3028] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#264639] cursor-pointer"
              >
                <option value="all">
                  Todos os teams ({feedbacks.length})
                </option>
                {TEAMS.map((t) => (
                  <option key={t} value={t}>
                    {t} ({teamCounts[t] || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#264639]" />
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquareHeart className="w-12 h-12 text-[#ded5c2] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#1c3028]">
              Nenhum feedback encontrado
            </p>
            <p className="text-xs text-[#507765] mt-1">
              {feedbacks.length === 0
                ? "Ainda não há respostas."
                : "Tente ajustar o filtro ou a busca."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-[#507765] font-semibold px-1">
              {filteredFeedbacks.length}{" "}
              {filteredFeedbacks.length === 1 ? "resultado" : "resultados"}
              {teamFilter !== "all" && ` • Filtrado por: ${teamFilter}`}
            </p>

            {filteredFeedbacks.map((f) => (
              <div
                key={f.id}
                className={`rounded-xl border shadow-2xs overflow-hidden transition-colors ${
                  selectedIds.has(f.id)
                    ? "border-[#264639] bg-[#e3ece7]"
                    : "border-[#ded5c2] bg-[#fcf9f2]"
                }`}
              >
                <div className="bg-[#ede4d3]/40 px-5 py-3 border-b border-[#ded5c2] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSelect(f.id)}
                      className="cursor-pointer text-[#507765] hover:text-[#264639] transition-colors"
                    >
                      {selectedIds.has(f.id) ? (
                        <CheckSquare className="w-4 h-4 text-[#264639]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <span className="text-[10px] font-bold bg-[#264639] text-[#f4eee3] px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {f.team}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#507765] font-medium">
                      {formatDate(f.created_at)}
                    </span>
                    <button
                      onClick={() => setDeleteConfirmSingleId(f.id)}
                      className="text-[#8a9890] hover:text-red-600 cursor-pointer transition-colors p-1 rounded-md hover:bg-red-50"
                      title="Excluir feedback"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black text-[#507765] uppercase tracking-wider mb-1.5">
                      ✅ O que leva de positivo
                    </h4>
                    <p className="text-sm text-[#1c3028] leading-relaxed whitespace-pre-wrap">
                      {f.positivo}
                    </p>
                  </div>
                  <div className="border-t border-[#ded5c2] pt-4">
                    <h4 className="text-[10px] font-black text-[#507765] uppercase tracking-wider mb-1.5">
                      🔧 O que podemos melhorar
                    </h4>
                    <p className="text-sm text-[#1c3028] leading-relaxed whitespace-pre-wrap">
                      {f.melhorar}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
