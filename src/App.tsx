/*
React Wedding App — TypeScript (Vite)
-----------------------------------
Single-file example: App.tsx

Features:
- RSVP form (Supabase table: rsvp)
- Gift list with reservation (Supabase table: presentes)
- Concurrency-safe reservation (update where reservado = false)
- Extremely lightweight logic

--- SETUP ---
1) Create project (Vite + React + TS):
   npm create vite@latest wedding-site -- --template react-ts
   cd wedding-site
   npm install

2) Install Supabase client:
   npm install @supabase/supabase-js

3) Environment variables (.env):
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY

4) Netlify build:
   Build command: npm run build
   Publish directory: dist

--- DATABASE (Supabase SQL) ---

create table presentes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  reservado boolean not null default false,
  reservado_por text,
  created_at timestamp default now()
);

create table rsvp (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  vai boolean not null,
  acompanhantes int default 0,
  created_at timestamp default now()
);

insert into presentes (nome) values
('Air Fryer'),('Jogo de Toalhas'),('Liquidificador'),('Cafeteira');

alter table presentes enable row level security;
create policy "read_presentes" on presentes for select using (true);
create policy "reserve_presente" on presentes for update using (reservado = false) with check (reservado = true);

alter table rsvp enable row level security;
create policy "insert_rsvp" on rsvp for insert with check (true);

--- APP CODE (App.tsx) ---
*/

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

console.log(SUPABASE_URL, SUPABASE_ANON_KEY);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- Types ----

type Presente = {
  id: string;
  nome: string;
};

type RsvpInsert = {
  nome: string;
  vai: boolean;
  acompanhantes: number;
};

export default function App() {
  // RSVP state
  const [nome, setNome] = useState<string>("");
  const [vai, setVai] = useState<boolean>(true);
  const [acompanhantes, setAcompanhantes] = useState<number>(0);
  const [rsvpLoading, setRsvpLoading] = useState<boolean>(false);

  // Presentes
  const [presentes, setPresentes] = useState<Presente[]>([]);
  const [loadingPresentes, setLoadingPresentes] = useState<boolean>(true);
  const [reservingId, setReservingId] = useState<string | null>(null);

  // Mensagens
  const [msg, setMsg] = useState<string | null>(null);

  async function carregarPresentes(): Promise<void> {
    setLoadingPresentes(true);
    console.log("entrou");

    const { data, error } = await supabase
      .from("presentes")
      .select("id, nome")
      .eq("reservado", false)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setMsg("Erro ao carregar presentes");
      setPresentes([]);
    } else {
      setPresentes((data as Presente[]) ?? []);
      setMsg(null);
    }

    setLoadingPresentes(false);
  }

  async function reservarPresente(id: string): Promise<void> {
    const nomeReserva = window.prompt(
      "Digite seu nome para reservar este presente:"
    );
    if (!nomeReserva) return;

    setReservingId(id);

    const { error } = await supabase
      .from("presentes")
      .update({ reservado: true, reservado_por: nomeReserva })
      .eq("id", id)
      .eq("reservado", false);

    if (error) {
      console.error(error);
      alert("Este presente já foi reservado por outra pessoa.");
    } else {
      setMsg("Presente reservado com sucesso! 🎁");
      carregarPresentes();
    }

    setReservingId(null);
  }

  async function confirmarPresenca(e: FormEvent): Promise<void> {
    e.preventDefault();

    if (!nome.trim()) {
      setMsg("Informe seu nome para confirmar presença.");
      return;
    }

    setRsvpLoading(true);

    const payload: RsvpInsert = {
      nome,
      vai,
      acompanhantes,
    };

    const { error } = await supabase.from("rsvp").insert(payload);

    if (error) {
      console.error(error);
      setMsg("Erro ao salvar confirmação de presença");
    } else {
      setMsg("Presença confirmada! ❤️");
      setNome("");
      setVai(true);
      setAcompanhantes(0);
    }

    setRsvpLoading(false);
  }

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarPresentes();

    const interval = setInterval(carregarPresentes, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white shadow-md rounded-2xl p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Nosso Casamento</h1>
          <p className="text-sm text-gray-500">
            Confirme sua presença e, se quiser, reserve um presente.
          </p>
        </header>

        {msg && (
          <div className="mb-4 p-3 rounded bg-emerald-50 text-emerald-700 text-sm">
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RSVP */}
          <section className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Confirmação de Presença</h2>

            <form onSubmit={confirmarPresenca}>
              <label className="block text-sm mb-1">Nome</label>
              <input
                className="w-full border rounded p-2 mb-3"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />

              <div className="mb-3 text-sm">
                <span className="mr-3">Você vai?</span>
                <label className="mr-3">
                  <input
                    type="radio"
                    checked={vai}
                    onChange={() => setVai(true)}
                  />{" "}
                  Sim
                </label>
                <label>
                  <input
                    type="radio"
                    checked={!vai}
                    onChange={() => setVai(false)}
                  />{" "}
                  Não
                </label>
              </div>

              <label className="block text-sm mb-1">Acompanhantes</label>
              <input
                type="number"
                min={0}
                className="w-24 border rounded p-2 mb-4"
                value={acompanhantes}
                onChange={(e) => setAcompanhantes(Number(e.target.value))}
              />

              <button
                type="submit"
                disabled={rsvpLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
              >
                {rsvpLoading ? "Enviando..." : "Confirmar"}
              </button>
            </form>
          </section>

          {/* Presentes */}
          <section className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Lista de Presentes</h2>

            {loadingPresentes ? (
              <p className="text-sm text-gray-500">Carregando...</p>
            ) : presentes.length === 0 ? (
              <p className="text-sm text-gray-500">
                Nenhum presente disponível.
              </p>
            ) : (
              <ul className="space-y-2">
                {presentes.map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between items-center border rounded p-2"
                  >
                    <span>{p.nome}</span>
                    <button
                      onClick={() => reservarPresente(p.id)}
                      disabled={reservingId === p.id}
                      className="text-sm px-3 py-1 bg-green-600 text-white rounded disabled:opacity-60"
                    >
                      {reservingId === p.id ? "Reservando..." : "Reservar"}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-3 text-xs text-gray-400">
              Ao reservar, o presente deixa de aparecer para os outros
              convidados.
            </p>
          </section>
        </div>

        <footer className="mt-6 text-center text-xs text-gray-400">
          React + TypeScript + Supabase — deploy gratuito no Netlify
        </footer>
      </div>
    </div>
  );
}
