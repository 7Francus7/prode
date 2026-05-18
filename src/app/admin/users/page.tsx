"use client";

import { useEffect, useState, useTransition } from "react";

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
  if (name) return name.slice(0, 2).toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

function Avatar({ name, email }: { name: string | null; email: string }) {
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
      style={{ background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)" }}
    >
      {initials(name, email)}
    </div>
  );
}

function PaidBadge({ paid }: { paid: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase"
      style={
        paid
          ? { background: "rgba(16,185,129,0.12)", color: "rgba(52,211,153,0.9)", border: "1px solid rgba(16,185,129,0.2)" }
          : { background: "rgba(202,138,4,0.1)", color: "rgba(250,204,21,0.75)", border: "1px solid rgba(202,138,4,0.18)" }
      }
    >
      <span
        className="w-1 h-1 rounded-full"
        style={{ background: paid ? "rgba(52,211,153,0.9)" : "rgba(250,204,21,0.75)" }}
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
      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
      style={
        isPaid
          ? {
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
              color: "rgba(252,165,165,0.75)",
            }
          : {
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.18)",
              color: "rgba(52,211,153,0.85)",
            }
      }
    >
      {pending ? "..." : isPaid ? "Desactivar" : "Activar pago"}
    </button>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{ id: string; msg: string } | null>(null);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Error al cargar usuarios");
      setUsers(await res.json());
    } catch {
      setError("No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleToggle(id: string, nextPaid: boolean) {
    const res = await fetch(`/api/admin/users/${id}/payment`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaid: nextPaid }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isPaid: nextPaid } : u))
      );
      const user = users.find((u) => u.id === id);
      setFeedback({
        id,
        msg: nextPaid
          ? `✓ ${user?.name ?? user?.email} activado`
          : `✓ ${user?.name ?? user?.email} desactivado`,
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  const paid = users.filter((u) => u.isPaid).length;
  const total = users.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-black text-white tracking-tight">Usuarios</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.45)" }}>
          Gestión de pagos e inscripciones
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: total },
          { label: "Activos", value: paid },
          { label: "Pendientes", value: total - paid },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl px-4 py-3 text-center"
            style={{
              background: "rgba(13,21,32,0.7)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p className="text-xl font-black text-white">{s.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider mt-0.5" style={{ color: "rgba(148,163,184,0.45)" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium animate-fade-in"
          style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.18)",
            color: "rgba(52,211,153,0.9)",
          }}
        >
          {feedback.msg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: "rgba(127,29,29,0.16)",
            border: "1px solid rgba(239,68,68,0.13)",
            color: "rgba(252,165,165,0.82)",
          }}
        >
          {error}
        </div>
      )}

      {/* User list */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(9, 14, 26, 0.75)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div
              className="w-5 h-5 rounded-full border-2 border-blue-500/30 border-t-blue-500"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center py-16 text-sm" style={{ color: "rgba(148,163,184,0.35)" }}>
            No hay usuarios registrados
          </p>
        ) : (
          <div>
            {users.map((user, i) => (
              <div
                key={user.id}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{
                  borderBottom: i < users.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}
              >
                <Avatar name={user.name} email={user.email} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.name ?? "Sin nombre"}
                    </p>
                    {user.isAdmin && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{
                          background: "rgba(59,130,246,0.15)",
                          color: "rgba(96,165,250,0.8)",
                          border: "1px solid rgba(59,130,246,0.15)",
                        }}
                      >
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: "rgba(148,163,184,0.45)" }}>
                    {user.email}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(100,116,139,0.4)" }}>
                    {new Date(user.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                    {" · "}
                    {user._count.predictions} predicciones
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <PaidBadge paid={user.isPaid} />
                  {!user.isAdmin && (
                    <ToggleButton
                      userId={user.id}
                      isPaid={user.isPaid}
                      onToggle={handleToggle}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-[10px]" style={{ color: "rgba(100,116,139,0.35)" }}>
        Los cambios aplican en el próximo refresh del usuario
      </p>
    </div>
  );
}
