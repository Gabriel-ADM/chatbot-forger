import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, FileText, Power, Trash2, Bot } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ChatbotCard({ chatbot, onEdit, onToggle, onDelete }) {
  const isActive = chatbot.status === "active";

  return (
    <div className="group bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
            isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground leading-tight">{chatbot.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={`text-[11px] font-medium px-2 py-0.5 ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${
                  isActive ? "bg-emerald-500" : "bg-slate-400"
                }`} />
                {isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Persona preview */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
        {chatbot.persona_prompt || "Sem prompt definido"}
      </p>

      {/* Document count */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
        <FileText className="h-3.5 w-3.5" />
        <span>{chatbot.document_count || 0} documento{(chatbot.document_count || 0) !== 1 ? "s" : ""}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(chatbot)}
        >
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Editar
        </Button>
        <Link to={`/ChatbotDocuments?id=${chatbot.id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Docs
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2.5 text-xs ${
            isActive ? "text-emerald-600 hover:text-emerald-700" : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onToggle(chatbot)}
        >
          <Power className="h-3.5 w-3.5 mr-1.5" />
          {isActive ? "Desligar" : "Ligar"}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs text-destructive hover:text-destructive ml-auto"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir chatbot</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir "{chatbot.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(chatbot.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}