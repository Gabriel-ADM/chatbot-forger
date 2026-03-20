import { useState, useRef } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { uploadDocument } from "@/api/documentsApi";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".pptx"];

export default function DocumentUploader({ chatbotId, onUploaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const getFileExtension = (name) => {
    const ext = name.substring(name.lastIndexOf(".")).toLowerCase();
    return ext;
  };

  const isValidFile = (file) => {
    const ext = getFileExtension(file.name);
    return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(ext);
  };

  const handleFiles = async (files) => {
    const selected = Array.from(files || []);
    const validFiles = selected.filter(isValidFile);

    if (selected.length !== validFiles.length) {
      toast({
        title: "Arquivos ignorados",
        description: "Apenas PDF, DOCX e PPTX são aceitos.",
        variant: "destructive",
      });
    }

    if (validFiles.length === 0) {
      toast({
        title: "Formato inválido",
        description: "Apenas PDF, DOCX e PPTX são aceitos.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      for (const file of validFiles) {
        await uploadDocument(chatbotId, file);
      }
      toast({
        title: "Upload concluído",
        description: `${validFiles.length} arquivo(s) enviado(s).`,
      });
      onUploaded?.();
    } catch (e) {
      toast({
        title: "Erro no upload",
        description:
          e.message || "Falha ao enviar (verifique BASE_URL no backend, etc.).",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragging
          ? "border-primary bg-accent"
          : "border-border hover:border-primary/40 hover:bg-muted/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.pptx"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm font-medium text-foreground">
            Enviando arquivos...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Formatos aceitos: PDF, DOCX, PPTX
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Múltiplos arquivos permitidos
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
