// services/adminScope.js

const ADMIN_SCOPES = {
  // ✅ super admin (vê tudo)
  "admin@teste.com.br": {
    label: "SUPER ADMIN",
    areaIds: ["iluminacao", "saude", "defesa"],
  },

  // ✅ admins por área
  "adminsaude@teste.com.br": {
    label: "ADMIN SAÚDE",
    areaIds: ["saude"],
  },

  "adminiluminacao@teste.com.br": {
    label: "ADMIN ILUMINAÇÃO",
    areaIds: ["iluminacao"],
  },

  "admindefesa@teste.com.br": {
    label: "ADMIN DEFESA",
    areaIds: ["defesa"],
  },
};

export function getAdminScopeByEmail(email) {
  const key = String(email || "")
    .trim()
    .toLowerCase();
  return ADMIN_SCOPES[key] || null;
}

// ✅ helper padrão (use em tudo)
export function isAdminEmail(email) {
  return !!getAdminScopeByEmail(email);
}
