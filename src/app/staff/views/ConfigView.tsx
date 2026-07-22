import { useEffect, useState } from "react";
import { Building2, RefreshCw, Shield, Users } from "lucide-react";

import { GOLD } from "../../theme";
import { SHeader } from "../../components/shared";
import { ApiError, api } from "../../lib/api";
import type { BackupFile } from "../../lib/types";

function formatBackupDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

// Segurança / Dados do Hotel / Perfis de Acesso ainda não têm entidade própria no backend — permanecem ilustrativos.
export function ConfigView() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [loadingBackups, setLoadingBackups] = useState(true);

  useEffect(() => {
    api.system
      .backups()
      .then(setBackups)
      .catch((err) => setBackupError(err instanceof ApiError ? err.message : "Não foi possível consultar o sistema de backup."))
      .finally(() => setLoadingBackups(false));
  }, []);

  const latest = backups[0];

  return (
    <div>
      <SHeader title="Configurações" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4"><Shield size={15} style={{ color: GOLD }} /><h3 className="font-medium text-sm">Segurança</h3></div>
          <div className="space-y-4">
            {[
              { label: "Autenticação 2FA", sub: "Login com código adicional", on: true },
              { label: "Sessão expira em 8h", sub: "Logout automático por inatividade", on: true },
              { label: "Log de acessos", sub: "Auditoria de entradas no sistema", on: true },
              { label: "Criptografia LGPD", sub: "CPF e dados sensíveis cifrados", on: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div><p className="text-sm font-medium text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.sub}</p></div>
                <div className="w-9 h-5 rounded-full relative" style={{ backgroundColor: item.on ? GOLD : "#E8E4DC" }}>
                  <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${item.on ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4"><Building2 size={15} style={{ color: GOLD }} /><h3 className="font-medium text-sm">Dados do Hotel</h3></div>
          <div className="space-y-3">
            {[
              { label: "Nome", value: "Grand Palácio Hotel" },
              { label: "CNPJ", value: "12.345.678/0001-99" },
              { label: "Endereço", value: "Av. Paulista, 1000 — São Paulo, SP" },
              { label: "Telefone", value: "(11) 3344-5500" },
              { label: "E-mail", value: "contato@grandpalacio.com.br" },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs text-muted-foreground block mb-1">{f.label}</label>
                <input defaultValue={f.value} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4"><RefreshCw size={15} style={{ color: GOLD }} /><h3 className="font-medium text-sm">Backup & Recuperação</h3></div>
          {loadingBackups ? (
            <p className="text-xs text-muted-foreground">Consultando sistema de backup...</p>
          ) : backupError ? (
            <p className="text-xs text-red-500">{backupError}</p>
          ) : latest ? (
            <div className="p-3 bg-muted rounded-lg mb-1">
              <p className="text-xs font-medium text-foreground">Último backup</p>
              <p className="text-sm font-semibold mt-0.5">{formatBackupDate(latest.created_at)}</p>
              <p className="text-xs text-muted-foreground">{latest.filename} · {(latest.size_bytes / 1024).toFixed(0)} KB</p>
              <p className="text-xs text-muted-foreground mt-1">{backups.length} backup{backups.length > 1 ? "s" : ""} disponíve{backups.length > 1 ? "is" : "l"} · automático a cada hora</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Nenhum backup gerado ainda — o serviço externo roda automaticamente a cada hora.</p>
          )}
        </div>
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4"><Users size={15} style={{ color: GOLD }} /><h3 className="font-medium text-sm">Perfis de Acesso</h3></div>
          <div className="space-y-2">
            {[
              { role: "Administrador", perms: "Acesso total", count: 1 },
              { role: "Gerente", perms: "Reservas, financeiro, relatórios", count: 1 },
              { role: "Recepcionista", perms: "Reservas, hóspedes, quartos", count: 2 },
              { role: "Governanta", perms: "Quartos e serviços", count: 1 },
            ].map((r) => (
              <div key={r.role} className="flex items-center justify-between p-2.5 bg-muted rounded-lg">
                <div><p className="text-sm font-medium text-foreground">{r.role}</p><p className="text-xs text-muted-foreground">{r.perms}</p></div>
                <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: "rgba(22,32,54,0.08)", color: "#162036" }}>{r.count} usuários</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4">Segurança, dados do hotel e perfis de acesso ainda são ilustrativos — só o Backup & Recuperação está ligado a um sistema real.</p>
    </div>
  );
}
