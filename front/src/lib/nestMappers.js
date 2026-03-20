/** API Nest (Prisma) → shape esperado pelos componentes de UI */

export function mapChatbotFromApi(row) {
  if (!row) return null;
  const count = row._count?.documents ?? row.document_count ?? 0;
  return {
    id: row.id,
    name: row.nome,
    persona_prompt: row.promptCliente ?? "",
    status: row.active ? "active" : "inactive",
    document_count: count,
    _raw: row,
  };
}

export function mapDocumentFromApi(row) {
  if (!row) return null;
  const mime = row.mimeType || "";
  const extFromMime = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptx",
  }[mime];
  const name = row.originalName || "";
  const dot = name.lastIndexOf(".");
  const ext =
    extFromMime ||
    (dot >= 0 ? name.slice(dot + 1).toLowerCase() : "file");

  const st = String(row.status || "").toUpperCase();
  const statusUi =
    st === "PENDING_DELETE" ? "pending_deletion" : "active";

  return {
    id: row.id,
    file_name: row.originalName,
    file_type: ext,
    created_date: row.createdAt,
    status: statusUi,
    _raw: row,
  };
}

export function toCreateChatbotPayload({ name, persona_prompt }) {
  return {
    nome: name,
    prompt_cliente: persona_prompt || "",
    active: true,
  };
}

export function toUpdateChatbotPayload({ name, persona_prompt }) {
  return {
    nome: name,
    prompt_cliente: persona_prompt,
  };
}
