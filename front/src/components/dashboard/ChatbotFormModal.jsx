import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const MAX_CHARS = 200;

export default function ChatbotFormModal({ open, onClose, onSubmit, chatbot }) {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!chatbot;
  const charCount = prompt.length;
  const isOverLimit = charCount > MAX_CHARS;

  useEffect(() => {
    if (chatbot) {
      setName(chatbot.name || "");
      setPrompt(chatbot.persona_prompt || "");
    } else {
      setName("");
      setPrompt("");
    }
  }, [chatbot, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || isOverLimit) return;
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), persona_prompt: prompt.trim() });
      onClose();
    } catch {
      // erro tratado no Dashboard (toast)
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {isEditing ? "Editar Chatbot" : "Novo Chatbot"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="bot-name" className="text-sm font-medium">
              Nome do Chatbot
            </Label>
            <Input
              id="bot-name"
              placeholder="Ex: Assistente de Vendas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bot-prompt" className="text-sm font-medium">
                Prompt de Persona
              </Label>
              <span className={`text-xs font-medium ${
                isOverLimit ? "text-destructive" : "text-muted-foreground"
              }`}>
                {charCount}/{MAX_CHARS}
              </span>
            </div>
            <Textarea
              id="bot-prompt"
              placeholder="Descreva a personalidade e comportamento do chatbot..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
            {isOverLimit && (
              <p className="text-xs text-destructive">
                O prompt excede o limite de {MAX_CHARS} caracteres.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isOverLimit || submitting}
              className="bg-primary hover:bg-primary/90"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Salvar" : "Criar Chatbot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}