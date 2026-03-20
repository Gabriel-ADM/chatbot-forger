import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, File } from "lucide-react";
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

const fileIcons = {
  pdf: "text-red-500",
  docx: "text-blue-500",
  pptx: "text-orange-500",
};

export default function DocumentList({ documents, onDelete }) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Nenhum documento enviado ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => {
        const isPending =
          doc.status === "pending_deletion" || doc.status === "PENDING_DELETE";
        return (
          <div
            key={doc.id}
            className="flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3 min-w-0">
              <File className={`h-5 w-5 flex-shrink-0 ${fileIcons[doc.file_type] || "text-muted-foreground"}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.created_date
                    ? format(new Date(doc.created_date), "dd MMM yyyy, HH:mm", { locale: ptBR })
                    : "—"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Badge
                variant="secondary"
                className={`text-[11px] font-medium ${
                  isPending
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {isPending ? "Pendente de Exclusão" : "Ativo"}
              </Badge>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover documento</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja remover "{doc.file_name}"?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={isPending}
                      onClick={() => onDelete(doc.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        );
      })}
    </div>
  );
}