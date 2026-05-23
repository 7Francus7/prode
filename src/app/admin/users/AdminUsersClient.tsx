"use client";

import { useState, useTransition } from "react";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  isPaid: boolean;
  isAdmin: boolean;
  createdAt: string;
  _count: { predictions: number };
};

function initials(name: string | null, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return email.slice(0, 2).toUpperCase();
}

function StatCard({
  eyebrow,
  label,
  value,
  tone = "neutral",
}: {
  eyebrow: string;
  label: string;
  value: string | number;
  tone?: "neutral" | "green" | "amber";
}) {
  const styles = {
    neutral: {
      background: "var(--app-panel-bg)",
      border: "1px solid var(--app-border)",
      valueClass: "text-white",
    },
    green: {
      background: "var(--app-stat-emerald-bg)",
      border: "1px solid var(--app-stat-emerald-border)",
      valueClass: "text-emerald-300",
    },
    amber: {
      background: "var(--app-stat-amber-bg)",
      border: "1px solid var(--app-stat-amber-border)",
      valueClass: "text-amber-300",
    },
  } as const;

  const toneStyle = styles[tone];

  return (
    <div
      className="relative overflow-hidden rounded-[1.4rem] p-4"
      style={{
        background: toneStyle.background,
        border: toneStyle.border,
        boxShadow: "var(--app-panel-shadow)",
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.72) 50%, rgba(255,255,255,0) 100%)",
        }}
      />
      <p className="theme-text-faint text-[0.56rem] font-semibold uppercase tracking-[0.22em]">
        {eyebrow}
      </p>
      <p className={`mt-3 font-display text-[1.9rem] font-bold leading-none ${toneStyle.valueClass}`}>
        {value}
      </p>
      <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

function Avatar({ name, email }: { name: string | null; email: string }) {
  return (
    <div
      className="flex h-11 w-11 items-center justify-center rounded-[1rem] text-[0.8rem] font-black text-white shrink-0"
      style={{
        background: "linear-gradient(135deg, rgba(59,130,246,0.95) 0%, rgba(37,99,235,0.9) 100%)",
        boxShadow: "0 14px 26px -18px rgba(37,99,235,0.55)",
      }}
    >
      {initials(name, email)}
    </div>
  );
}

function PaidBadge({ paid }: { paid: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
      style={
        paid
          ? {
              background: "rgba(16,185,129,0.12)",
              color: "rgba(16,185,129,0.9)",
              border: "1px solid rgba(16,185,129,0.18)",
            }
          : {
              background: "rgba(245,158,11,0.1)",
              color: "rgba(180,83,9,0.92)",
              border: "1px solid rgba(245,158,11,0.18)",
            }
      }
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: paid ? "rgba(16,185,129,0.9)" : "rgba(245,158,11,0.9)" }}
      />
      {paid ? "Activo" : "Pendiente"}
    </span>
  );
}

function ToggleButton({
  userId,
  isPaid,
  onToggle,
}: {
  userId: string;
  isPaid: boolean;
  onToggle: (id: string, next: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => onToggle(userId, !isPaid));
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="rounded-full px-3.5 py-2 text-[0.72rem] font-semibold transition-all disabled:opacity-40"
      style={
        isPaid
          ? {
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.14)",
              color: "rgba(248,113,113,0.88)",
            }
          : {
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.16)",
              color: "rgba(5,150,105,0.92)",
            }
      }
    >
      {pending ? "..." : isPaid ? "Desactivar" : "Activar pago"}
    </button>
  );
}

export default function AdminUsersClient({
  initialUsers,
}: {
  initialUsers: AdminUser[];
}) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{ id: string; msg: string } | null>(null);

  async function handleToggle(id: string, nextPaid: boolean) {
    setError("");

    const response = await fetch(`/api/admin/users/${id}/payment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaid: nextPaid }),
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "No se pudo actualizar el pago");
      return;
    }

    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, isPaid: nextPaid } : user)));

    const user = users.find((entry) => entry.id === id);
    setFeedback({
      id,
      msg: nextPaid ? `${user?.name ?? user?.email} activado` : `${user?.name ?? user?.email} desactivado`,
    });
    setTimeout(() => setFeedback(null), 3000);
  }

  const paid = users.filter((user) => user.isPaid).length;
  const total = users.length;
  const pending = total - paid;

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-[2rem] border px-5 py-5"
        style={{
          background: "var(--app-hero-bg)",
          borderColor: "var(--app-hero-border)",
          boxShadow: "var(--app-hero-shadow)",
        }}
      >
        <div
          className="absolute inset-x-6 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(59,130,246,0.28) 50%, rgba(59,130,246,0) 100%)",
          }}
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[34rem]">
            <p className="theme-text-faint text-[0.62rem] font-semibold uppercase tracking-[0.24em]">
              Admin / usuarios
            </p>
            <h1 className="mt-1 font-display text-[2rem] font-bold leading-none text-white">
              Gestion de pagos e inscripciones
            </h1>
            <p className="theme-text-muted mt-2 text-[0.92rem] leading-relaxed">
              Revisa el estado de pago, controla la base activa y habilita rapidamente a cada jugador.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:min-w-[26rem]">
            <StatCard eyebrow="Base" label="Total" value={total} />
            <StatCard eyebrow="Estado" label="Activos" value={paid} tone="green" />
            <StatCard eyebrow="Pendiente" label="Por revisar" value={pending} tone="amber" />
          </div>
        </div>
      </section>

      {feedback && (
        <div
          className="rounded-[1.2rem] px-4 py-3 text-sm font-medium animate-fade-in"
          style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.18)",
            color: "rgba(5,150,105,0.92)",
          }}
        >
          {feedback.msg}
        </div>
      )}

      {error && (
        <div
          className="rounded-[1.2rem] px-4 py-3 text-sm"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.13)",
            color: "rgba(185,28,28,0.9)",
          }}
        >
          {error}
        </div>
      )}

      <section className="theme-panel overflow-hidden rounded-[1.8rem]">
        <div className="flex items-center justify-between gap-4 border-b border-brand-border px-4 py-4">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Operacion
            </p>
            <p className="theme-text mt-1 text-sm font-semibold">Lista de jugadores</p>
          </div>
          <span className="theme-text-soft text-[0.72rem]">{pending > 0 ? `${pending} pendientes` : "Todo al dia"}</span>
        </div>

        {users.length === 0 ? (
          <p className="theme-text-soft py-16 text-center text-sm">No hay usuarios registrados</p>
        ) : (
          <div>
            {users.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center gap-3 px-4 py-4"
                style={{ borderBottom: index < users.length - 1 ? "1px solid var(--app-border)" : "none" }}
              >
                <Avatar name={user.name} email={user.email} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{user.name ?? "Sin nombre"}</p>
                    {user.isAdmin && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.18em]"
                        style={{
                          background: "rgba(59,130,246,0.12)",
                          border: "1px solid rgba(59,130,246,0.16)",
                          color: "rgba(96,165,250,0.9)",
                        }}
                      >
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="theme-text-soft mt-1 truncate text-[0.8rem]">{user.email}</p>
                  <p className="theme-text-faint mt-1 text-[0.72rem]">
                    {new Date(user.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    - {user._count.predictions} predicciones
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                  <PaidBadge paid={user.isPaid} />
                  {!user.isAdmin && (
                    <ToggleButton userId={user.id} isPaid={user.isPaid} onToggle={handleToggle} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="theme-text-faint text-center text-[0.68rem]">
        Los cambios se reflejan en el proximo refresh del usuario.
      </p>
    </div>
  );
}
