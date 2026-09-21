"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Send, CheckCircle2, MessageSquareHeart } from "lucide-react";
import { CopacabanaWave } from "@/components/ColoDeDeusBrand";
import Image from "next/image";

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

export function FeedbackForm() {
  const [positivo, setPositivo] = useState("");
  const [melhorar, setMelhorar] = useState("");
  const [team, setTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!positivo.trim() || !melhorar.trim() || !team) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    const { error: dbError } = await supabase
      .from("feedbacks")
      .insert({ positivo: positivo.trim(), melhorar: melhorar.trim(), team });

    setLoading(false);

    if (dbError) {
      setError("Erro ao enviar. Tente novamente.");
      console.error(dbError);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="rounded-2xl bg-[#264639] text-[#f4eee3] shadow-md border border-[#1a3328] overflow-hidden">
          <div className="p-8 sm:p-12 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 mx-auto text-[#e9decb]" />
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Feedback Enviado!
            </h2>
            <p className="text-sm sm:text-base text-[#d2dfd8] leading-relaxed max-w-md mx-auto">
              Obrigado por compartilhar sua experiência. Seu feedback é
              fundamental para que a próxima Conferência seja ainda melhor! 🔥
            </p>
          </div>
          <CopacabanaWave />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Hero Card */}
      <div className="rounded-2xl bg-[#264639] text-[#f4eee3] shadow-md border border-[#1a3328] overflow-hidden relative">
        <div className="p-5 sm:p-7 space-y-3.5 relative z-10">
          <div className="flex items-center">
            <Image
              src="/logo-colodedeus.png"
              alt="Colo de Deus"
              width={140}
              height={26}
              className="h-5 sm:h-6 w-auto object-contain opacity-90"
            />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#e9decb] block">
              * UM DIA DE GLÓRIA *
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#f4eee3] uppercase">
              Feedback
            </h1>
            <p className="text-xs sm:text-sm text-[#f4eee3] leading-relaxed font-medium pt-0.5">
              Sua opinião é muito importante para nós! Compartilhe o que você
              viveu na Conf 1DG e nos ajude a construir experiências cada vez
              melhores 🔥
            </p>
          </div>

          <div className="bg-black/25 backdrop-blur-sm border border-white/20 rounded-xl p-4 space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="bg-[#f4eee3] text-[#264639] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1.5">
                🔒 100% ANÔNIMO
              </span>
            </div>
            <p className="text-[#f4eee3] leading-relaxed font-medium">
              Nenhuma informação pessoal é coletada. Suas respostas são
              completamente anônimas e serão usadas exclusivamente para
              melhorar nossos eventos.
            </p>
          </div>
        </div>
        <CopacabanaWave />
      </div>

      {/* Formulário */}
      <div className="rounded-xl border border-[#ded5c2] bg-[#fcf9f2] text-[#1c3028] shadow-xs">
        <div className="p-6 space-y-5">
          {/* Pergunta 1 */}
          <div className="space-y-2">
            <label
              htmlFor="positivo"
              className="text-sm font-medium leading-none text-slate-700 flex items-center gap-1"
            >
              O que você leva de positivo da Conf 1DG?
              <span className="text-red-500 font-bold">*</span>
            </label>
            <textarea
              id="positivo"
              value={positivo}
              onChange={(e) => setPositivo(e.target.value)}
              placeholder="Conte o que mais te marcou, momentos especiais, aprendizados..."
              required
              rows={4}
              className="flex w-full rounded-lg border border-[#ded5c2] bg-white px-3 py-2 text-sm text-[#1c3028] placeholder:text-[#8a9890] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#264639] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-2xs resize-none"
            />
          </div>

          {/* Pergunta 2 */}
          <div className="space-y-2">
            <label
              htmlFor="melhorar"
              className="text-sm font-medium leading-none text-slate-700 flex items-center gap-1"
            >
              O que podemos melhorar?
              <span className="text-red-500 font-bold">*</span>
            </label>
            <textarea
              id="melhorar"
              value={melhorar}
              onChange={(e) => setMelhorar(e.target.value)}
              placeholder="Sugestões, críticas construtivas, pontos de atenção..."
              required
              rows={4}
              className="flex w-full rounded-lg border border-[#ded5c2] bg-white px-3 py-2 text-sm text-[#1c3028] placeholder:text-[#8a9890] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#264639] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-2xs resize-none"
            />
          </div>

          {/* Pergunta 3 - Dropdown */}
          <div className="space-y-2">
            <label
              htmlFor="team"
              className="text-sm font-medium leading-none text-slate-700 flex items-center gap-1"
            >
              Qual foi seu Team na Conf?
              <span className="text-red-500 font-bold">*</span>
            </label>
            <select
              id="team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              required
              className="flex h-10 w-full rounded-lg border border-[#ded5c2] bg-white px-3 py-2 text-sm text-[#1c3028] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#264639] focus-visible:border-transparent transition-colors shadow-2xs cursor-pointer"
            >
              <option value="" disabled>
                Selecione seu team...
              </option>
              {TEAMS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Botão */}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#264639] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] w-full bg-[#264639] hover:bg-[#1b3329] text-[#f4eee3] font-black h-12 text-sm sm:text-base px-6 shadow-md cursor-pointer transition-colors gap-2"
      >
        {loading ? (
          <span className="animate-pulse">Enviando...</span>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Enviar Feedback
          </>
        )}
      </button>
    </form>
  );
}
