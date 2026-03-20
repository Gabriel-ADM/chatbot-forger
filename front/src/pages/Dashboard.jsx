import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Bot } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  createChatbot,
  listChatbots,
  setChatbotStatus,
  updateChatbot,
} from "@/api/chatbotsApi";
import { listDocuments } from "@/api/documentsApi";
import {
  mapChatbotFromApi,
  toCreateChatbotPayload,
  toUpdateChatbotPayload,
} from "@/lib/nestMappers";
import StatsBar from "@/components/dashboard/StatsBar";
import ChatbotCard from "@/components/dashboard/ChatbotCard";
import ChatbotFormModal from "@/components/dashboard/ChatbotFormModal";

const DASHBOARD_QK = ["app", "chatbots-dashboard"];

async function loadChatbotsWithDocCounts() {
  const raw = await listChatbots();
  const docCountMap = {};
  let documentsTotal = 0;
  for (const row of raw) {
    const docs = await listDocuments(row.id);
    docCountMap[row.id] = docs.length;
    documentsTotal += docs.length;
  }
  const chatbots = raw.map((r) => ({
    ...mapChatbotFromApi(r),
    document_count: docCountMap[r.id] ?? 0,
  }));
  return { chatbots, documentsTotal };
}

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: DASHBOARD_QK,
    queryFn: loadChatbotsWithDocCounts,
  });

  const chatbots = data?.chatbots ?? [];
  const documentsTotal = data?.documentsTotal ?? 0;

  const createMutation = useMutation({
    mutationFn: (payload) => createChatbot(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QK });
      toast({
        title: "Chatbot criado",
        description: "Chatbot criado com sucesso.",
      });
    },
    onError: (e) => {
      toast({
        title: "Erro ao criar",
        description: e.message || "Falha ao criar chatbot.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateChatbot(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QK });
      toast({ title: "Salvo", description: "Chatbot atualizado." });
    },
    onError: (e) => {
      toast({
        title: "Erro ao salvar",
        description: e.message || "Falha ao atualizar.",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => setChatbotStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QK });
    },
    onError: (e) => {
      toast({
        title: "Erro ao alterar status",
        description: e.message || "Falha no PATCH de status.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (form) => {
    if (editingBot) {
      await updateMutation.mutateAsync({
        id: editingBot.id,
        body: toUpdateChatbotPayload({
          name: form.name,
          persona_prompt: form.persona_prompt,
        }),
      });
    } else {
      await createMutation.mutateAsync(toCreateChatbotPayload(form));
    }
  };

  const handleToggle = async (chatbot) => {
    const nextActive = chatbot.status !== "active";
    await toggleMutation.mutateAsync({
      id: chatbot.id,
      active: nextActive,
    });
  };

  const handleDelete = async () => {
    toast({
      title: "Não disponível",
      description:
        "A API Nest atual não expõe DELETE de chatbot; use o backend se precisar.",
      variant: "destructive",
    });
  };

  const handleEdit = (chatbot) => {
    setEditingBot(chatbot);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBot(null);
  };

  const filteredBots = chatbots.filter((b) =>
    b.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie seus chatbots de IA em um só lugar.
        </p>
      </div>

      <StatsBar
        chatbots={chatbots}
        documentsCount={documentsTotal}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar chatbots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <Button
          onClick={() => {
            setEditingBot(null);
            setModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 h-10"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Chatbot
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-5 animate-pulse"
            >
              <div className="h-10 w-10 rounded-xl bg-muted mb-4" />
              <div className="h-4 w-32 bg-muted rounded mb-2" />
              <div className="h-3 w-48 bg-muted rounded mb-4" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : filteredBots.length === 0 ? (
        <div className="text-center py-20">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">
            {search ? "Nenhum chatbot encontrado" : "Nenhum chatbot criado"}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {search
              ? "Tente uma busca diferente."
              : "Crie seu primeiro chatbot para começar."}
          </p>
          {!search && (
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Chatbot
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBots.map((bot) => (
            <ChatbotCard
              key={bot.id}
              chatbot={bot}
              onEdit={handleEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ChatbotFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        chatbot={editingBot}
      />
    </div>
  );
}
