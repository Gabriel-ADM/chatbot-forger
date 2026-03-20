import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { listChatbots } from "@/api/chatbotsApi";
import { deleteDocument, listDocuments } from "@/api/documentsApi";
import { mapChatbotFromApi, mapDocumentFromApi } from "@/lib/nestMappers";
import DocumentUploader from "@/components/documents/DocumentUploader";
import DocumentList from "@/components/documents/DocumentList";

const DASHBOARD_QK = ["app", "chatbots-dashboard"];

export default function ChatbotDocuments() {
  const urlParams = new URLSearchParams(window.location.search);
  const chatbotId = urlParams.get("id");
  const queryClient = useQueryClient();

  const { data: chatbot, isLoading: loadingBot } = useQuery({
    queryKey: ["chatbot", chatbotId],
    queryFn: async () => {
      const raw = await listChatbots();
      const row = raw.find((b) => b.id === chatbotId);
      return row ? mapChatbotFromApi(row) : null;
    },
    enabled: !!chatbotId,
  });

  const { data: documents = [], isLoading: loadingDocs } = useQuery({
    queryKey: ["documents", chatbotId],
    queryFn: async () => {
      const raw = await listDocuments(chatbotId);
      return raw.map(mapDocumentFromApi);
    },
    enabled: !!chatbotId,
  });

  const deleteMutation = useMutation({
    mutationFn: (docId) => deleteDocument(chatbotId, docId),
    onMutate: async (docId) => {
      await queryClient.cancelQueries({ queryKey: ["documents", chatbotId] });
      const prev = queryClient.getQueryData(["documents", chatbotId]) || [];
      queryClient.setQueryData(["documents", chatbotId], (current = []) =>
        (Array.isArray(current) ? current : []).map((doc) =>
          doc.id === docId ? { ...doc, status: "pending_deletion" } : doc
        )
      );
      return { prev };
    },
    onSuccess: () => {
      toast({
        title: "Documento",
        description: "Marcado como pendente de exclusão.",
      });
    },
    onError: (err, _id, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(["documents", chatbotId], ctx.prev);
      }
      toast({
        title: "Erro",
        description: err.message || "Falha ao remover documento.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", chatbotId] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QK });
    },
  });

  const handleUploaded = () => {
    queryClient.invalidateQueries({ queryKey: ["documents", chatbotId] });
    queryClient.invalidateQueries({ queryKey: DASHBOARD_QK });
  };

  const handleDelete = (docId) => deleteMutation.mutate(docId);

  if (loadingBot) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-20 bg-muted rounded-xl" />
          <div className="h-40 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <Bot className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-foreground mb-2">
          Chatbot não encontrado
        </h2>
        <Link to="/Dashboard">
          <Button variant="outline">Voltar ao Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isActive = chatbot.status === "active";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link to="/Dashboard">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Voltar
        </Button>
      </Link>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center ${
              isActive
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Bot className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground">
                {chatbot.name}
              </h1>
              <Badge
                variant="secondary"
                className={`text-[11px] font-medium ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {chatbot.persona_prompt || "Sem prompt definido"}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>
              {documents.length} documento{documents.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">
          Enviar Documentos
        </h2>
        <DocumentUploader chatbotId={chatbotId} onUploaded={handleUploaded} />
      </div>

      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">
          Documentos Enviados
        </h2>
        {loadingDocs ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <DocumentList documents={documents} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
