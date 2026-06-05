"use client";

import { type ReactNode, useMemo, useState } from "react";
import {
  Check,
  CreditCard,
  Lock,
  Pencil,
  Trash2,
  Unlock,
  X,
} from "lucide-react";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  isPaid: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isBlocked: boolean;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
  _count: { predictions: number; predictionPoints: number };
};

type UserDraft = {
  name: string;
  email: string;
  isPaid: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isBlocked: boolean;
};

type UserPatch = Partial<Pick<AdminUser, "name" | "email" | "isPaid" | "isAdmin" | "isSuperAdmin" | "isBlocked">>;

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
  tone?: "neutral" | "green" | "amber" | "red";
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
    red: {
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.14)",
      valueClass: "text-red-300",
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

function Avatar({ name, email, blocked }: { name: string | null; email: string; blocked: boolean }) {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] text-[0.8rem] font-black text-white"
      style={{
        background: blocked
          ? "linear-gradient(135deg, rgba(100,116,139,0.85) 0%, rgba(51,65,85,0.9) 100%)"
          : "linear-gradient(135deg, rgba(59,130,246,0.95) 0%, rgba(37,99,235,0.9) 100%)",
        boxShadow: "0 14px 26px -18px rgba(37,99,235,0.55)",
      }}
    >
      {initials(name, email)}
    </div>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "amber" | "blue" | "red" | "slate" | "gold";
}) {
  const tones = {
    green: {
      background: "rgba(16,185,129,0.12)",
      color: "rgba(52,211,153,0.92)",
      border: "1px solid rgba(16,185,129,0.18)",
    },
    amber: {
      background: "rgba(245,158,11,0.1)",
      color: "rgba(251,191,36,0.9)",
      border: "1px solid rgba(245,158,11,0.18)",
    },
    blue: {
      background: "rgba(59,130,246,0.12)",
      color: "rgba(96,165,250,0.9)",
      border: "1px solid rgba(59,130,246,0.16)",
    },
    red: {
      background: "rgba(239,68,68,0.09)",
      color: "rgba(248,113,113,0.92)",
      border: "1px solid rgba(239,68,68,0.16)",
    },
    slate: {
      background: "rgba(148,163,184,0.08)",
      color: "rgba(148,163,184,0.9)",
      border: "1px solid rgba(148,163,184,0.14)",
    },
    gold: {
      background: "rgba(245,158,11,0.12)",
      color: "rgba(252,211,77,0.95)",
      border: "1px solid rgba(245,158,11,0.2)",
    },
  } as const;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
      style={tones[tone]}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tones[tone].color }} />
      {label}
    </span>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  tone = "neutral",
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "neutral" | "green" | "red" | "amber";
  title?: string;
}) {
  const tones = {
    neutral: {
      background: "var(--app-panel-soft-bg)",
      border: "1px solid var(--app-border)",
      color: "var(--app-text-muted)",
    },
    green: {
      background: "rgba(16,185,129,0.12)",
      border: "1px solid rgba(16,185,129,0.16)",
      color: "rgba(52,211,153,0.92)",
    },
    red: {
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.14)",
      color: "rgba(248,113,113,0.9)",
    },
    amber: {
      background: "rgba(245,158,11,0.1)",
      border: "1px solid rgba(245,158,11,0.16)",
      color: "rgba(252,211,77,0.95)",
    },
  } as const;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-3.5 text-[0.76rem] font-semibold transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
      style={tones[tone]}
    >
      {children}
    </button>
  );
}

function SwitchField({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex min-h-[48px] items-center justify-between gap-3 rounded-[1rem] px-3 text-left transition-colors disabled:opacity-40"
      style={{
        background: checked ? "rgba(59,130,246,0.11)" : "var(--app-panel-soft-bg)",
        border: checked ? "1px solid rgba(59,130,246,0.16)" : "1px solid var(--app-border)",
      }}
    >
      <span className="theme-text text-[0.82rem] font-semibold">{label}</span>
      <span
        className="relative h-6 w-11 rounded-full transition-colors"
        style={{ background: checked ? "rgba(59,130,246,0.85)" : "rgba(100,116,139,0.35)" }}
      >
        <span
          className="absolute top-1 h-4 w-4 rounded-full bg-white transition-transform"
          style={{ transform: checked ? "translateX(22px)" : "translateX(4px)" }}
        />
      </span>
    </button>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUsersClient({
  initialUsers,
  currentUserId,
  canManageAccounts,
}: {
  initialUsers: AdminUser[];
  currentUserId: string;
  canManageAccounts: boolean;
}) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<UserDraft | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const stats = useMemo(() => {
    const blocked = users.filter((user) => user.isBlocked).length;
    const paid = users.filter((user) => user.isPaid && !user.isBlocked && !user.isAdmin).length;
    const admins = users.filter((user) => user.isAdmin).length;
    return { total: users.length, paid, blocked, admins };
  }, [users]);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 3000);
  }

  function openEdit(user: AdminUser) {
    setError("");
    setEditingId(user.id);
    setDraft({
      name: user.name ?? "",
      email: user.email,
      isPaid: user.isPaid,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      isBlocked: user.isBlocked,
    });
  }

  function closeEdit() {
    setEditingId(null);
    setDraft(null);
  }

  async function patchUser(id: string, payload: UserPatch, successMessage: string) {
    setError("");
    setBusyAction(`${id}:patch`);

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => ({}))) as {
        data?: AdminUser;
        error?: string;
      };

      if (!response.ok || !result.data) {
        setError(result.error ?? "No se pudo actualizar la cuenta");
        return false;
      }

      setUsers((prev) => prev.map((user) => (user.id === id ? result.data! : user)));
      showFeedback(successMessage);
      return true;
    } finally {
      setBusyAction(null);
    }
  }

  async function handlePaymentToggle(user: AdminUser) {
    await patchUser(
      user.id,
      { isPaid: !user.isPaid },
      !user.isPaid ? `${user.name ?? user.email} activado` : `${user.name ?? user.email} paso a pendiente`
    );
  }

  async function handleBlockToggle(user: AdminUser) {
    if (!canManageAccounts) return;
    await patchUser(
      user.id,
      { isBlocked: !user.isBlocked },
      !user.isBlocked ? `${user.name ?? user.email} bloqueado` : `${user.name ?? user.email} desbloqueado`
    );
  }

  async function handleSave() {
    if (!editingId || !draft || !canManageAccounts) return;

    const payload: UserPatch = {
      name: draft.name.trim(),
      email: draft.email.trim().toLowerCase(),
      isPaid: draft.isPaid,
      isAdmin: draft.isAdmin,
      isSuperAdmin: draft.isSuperAdmin,
      isBlocked: draft.isBlocked,
    };

    const ok = await patchUser(editingId, payload, "Cuenta actualizada");
    if (ok) closeEdit();
  }

  async function handleDelete(user: AdminUser) {
    if (!canManageAccounts || user.id === currentUserId) return;
    const confirmed = window.confirm(`Eliminar definitivamente la cuenta de ${user.name ?? user.email}?`);
    if (!confirmed) return;

    setError("");
    setBusyAction(`${user.id}:delete`);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "No se pudo eliminar la cuenta");
        return;
      }

      setUsers((prev) => prev.filter((entry) => entry.id !== user.id));
      if (editingId === user.id) closeEdit();
      showFeedback("Cuenta eliminada");
    } finally {
      setBusyAction(null);
    }
  }

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
              Gestion de cuentas
            </h1>
            <p className="theme-text-muted mt-2 text-[0.92rem] leading-relaxed">
              Pagos, permisos, bloqueos y bajas desde una sola lista.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[34rem]">
            <StatCard eyebrow="Base" label="Total" value={stats.total} />
            <StatCard eyebrow="Jugadores" label="Activos" value={stats.paid} tone="green" />
            <StatCard eyebrow="Control" label="Admins" value={stats.admins} tone="amber" />
            <StatCard eyebrow="Acceso" label="Bloqueados" value={stats.blocked} tone="red" />
          </div>
        </div>
      </section>

      {feedback && (
        <div
          className="rounded-[1.2rem] px-4 py-3 text-sm font-medium animate-fade-in"
          style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.18)",
            color: "rgba(52,211,153,0.92)",
          }}
        >
          {feedback}
        </div>
      )}

      {error && (
        <div
          className="rounded-[1.2rem] px-4 py-3 text-sm"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.13)",
            color: "rgba(248,113,113,0.9)",
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
            <p className="theme-text mt-1 text-sm font-semibold">Lista de usuarios</p>
          </div>
          <StatusBadge
            label={canManageAccounts ? "Super admin" : "Admin"}
            tone={canManageAccounts ? "gold" : "blue"}
          />
        </div>

        {users.length === 0 ? (
          <p className="theme-text-soft py-16 text-center text-sm">No hay usuarios registrados</p>
        ) : (
          <div>
            {users.map((user, index) => {
              const isSelf = user.id === currentUserId;
              const isEditing = editingId === user.id;
              const isBusy = busyAction?.startsWith(`${user.id}:`) ?? false;
              const canQuickPay = canManageAccounts || !user.isAdmin;
              const canDelete = canManageAccounts && !isSelf;
              const canBlock = canManageAccounts && !isSelf && !user.isSuperAdmin;

              return (
                <div
                  key={user.id}
                  className="px-4 py-4"
                  style={{ borderBottom: index < users.length - 1 ? "1px solid var(--app-border)" : "none" }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar name={user.name} email={user.email} blocked={user.isBlocked} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">{user.name ?? "Sin nombre"}</p>
                          {isSelf ? <StatusBadge label="Vos" tone="slate" /> : null}
                          {user.isSuperAdmin ? (
                            <StatusBadge label="Super" tone="gold" />
                          ) : user.isAdmin ? (
                            <StatusBadge label="Admin" tone="blue" />
                          ) : null}
                          {user.isBlocked ? <StatusBadge label="Bloqueado" tone="red" /> : null}
                        </div>
                        <p className="theme-text-soft mt-1 truncate text-[0.8rem]">{user.email}</p>
                        <p className="theme-text-faint mt-1 text-[0.72rem]">
                          {formatDate(user.createdAt)} - {user._count.predictions} predicciones - {user.totalPoints} pts
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <StatusBadge
                        label={user.isPaid && !user.isBlocked ? "Activo" : "Pendiente"}
                        tone={user.isPaid && !user.isBlocked ? "green" : "amber"}
                      />

                      {canQuickPay ? (
                        <ActionButton
                          onClick={() => handlePaymentToggle(user)}
                          disabled={isBusy || user.isBlocked}
                          tone={user.isPaid ? "red" : "green"}
                          title={user.isPaid ? "Pasar a pendiente" : "Activar pago"}
                        >
                          <CreditCard size={15} />
                          {user.isPaid ? "Pausar pago" : "Activar pago"}
                        </ActionButton>
                      ) : null}

                      {canManageAccounts ? (
                        <>
                          <ActionButton
                            onClick={() => openEdit(user)}
                            disabled={isBusy}
                            title="Editar cuenta"
                          >
                            <Pencil size={15} />
                            Editar
                          </ActionButton>
                          <ActionButton
                            onClick={() => handleBlockToggle(user)}
                            disabled={isBusy || !canBlock}
                            tone={user.isBlocked ? "green" : "amber"}
                            title={user.isBlocked ? "Desbloquear" : "Bloquear"}
                          >
                            {user.isBlocked ? <Unlock size={15} /> : <Lock size={15} />}
                            {user.isBlocked ? "Desbloquear" : "Bloquear"}
                          </ActionButton>
                          <ActionButton
                            onClick={() => handleDelete(user)}
                            disabled={isBusy || !canDelete}
                            tone="red"
                            title="Eliminar cuenta"
                          >
                            <Trash2 size={15} />
                            Eliminar
                          </ActionButton>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {isEditing && draft ? (
                    <div
                      className="mt-4 rounded-[1.4rem] border p-4"
                      style={{
                        background: "var(--app-panel-soft-bg)",
                        borderColor: "var(--app-border)",
                      }}
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="space-y-1.5">
                          <span className="theme-text-faint text-[0.62rem] font-semibold uppercase tracking-[0.18em]">
                            Nombre
                          </span>
                          <input
                            value={draft.name}
                            onChange={(event) => setDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
                            className="input-premium min-h-[48px] w-full rounded-[14px] px-4 text-[15px] theme-text"
                            style={{
                              background: "var(--app-input-bg)",
                              border: "1px solid var(--app-input-border)",
                            }}
                          />
                        </label>

                        <label className="space-y-1.5">
                          <span className="theme-text-faint text-[0.62rem] font-semibold uppercase tracking-[0.18em]">
                            Email
                          </span>
                          <input
                            type="email"
                            value={draft.email}
                            onChange={(event) => setDraft((prev) => (prev ? { ...prev, email: event.target.value } : prev))}
                            className="input-premium min-h-[48px] w-full rounded-[14px] px-4 text-[15px] theme-text"
                            style={{
                              background: "var(--app-input-bg)",
                              border: "1px solid var(--app-input-border)",
                            }}
                          />
                        </label>
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        <SwitchField
                          label="Pago activo"
                          checked={draft.isPaid}
                          onChange={(checked) => setDraft((prev) => (prev ? { ...prev, isPaid: checked } : prev))}
                        />
                        <SwitchField
                          label="Admin"
                          checked={draft.isAdmin}
                          disabled={isSelf}
                          onChange={(checked) =>
                            setDraft((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    isAdmin: checked,
                                    isSuperAdmin: checked ? prev.isSuperAdmin : false,
                                  }
                                : prev
                            )
                          }
                        />
                        <SwitchField
                          label="Super admin"
                          checked={draft.isSuperAdmin}
                          disabled={isSelf || draft.isBlocked}
                          onChange={(checked) =>
                            setDraft((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    isSuperAdmin: checked,
                                    isAdmin: checked ? true : prev.isAdmin,
                                  }
                                : prev
                            )
                          }
                        />
                        <SwitchField
                          label="Bloqueado"
                          checked={draft.isBlocked}
                          disabled={isSelf || draft.isSuperAdmin}
                          onChange={(checked) =>
                            setDraft((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    isBlocked: checked,
                                  }
                                : prev
                            )
                          }
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap justify-end gap-2">
                        <ActionButton onClick={closeEdit} disabled={isBusy}>
                          <X size={15} />
                          Cancelar
                        </ActionButton>
                        <ActionButton onClick={handleSave} disabled={isBusy} tone="green">
                          <Check size={15} />
                          Guardar
                        </ActionButton>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {!canManageAccounts ? (
        <p className="theme-text-faint text-center text-[0.68rem]">
          Las acciones de bloqueo, edicion y baja requieren super admin.
        </p>
      ) : null}
    </div>
  );
}
