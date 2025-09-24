import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Eye, Edit3, Download, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

interface Document {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MarkdownEditorProps {
  document?: Document;
  onSave: (title: string, content: string) => void;
  onTitleChange: (title: string) => void;
}

export function MarkdownEditor({ document, onSave, onTitleChange }: MarkdownEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [title, setTitle] = useState(document?.title || "");
  const [content, setContent] = useState(document?.content || "");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
      setHasUnsavedChanges(false);
    }
  }, [document]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
    onTitleChange(newTitle);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onSave(title, content);
    setHasUnsavedChanges(false);
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${title || "documento"}.md`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!document) {
    return (
      <div className="h-full flex items-center justify-center bg-content-bg">
        <div className="text-center">
          <Edit3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Bem-vindo ao Editor de Documentos
          </h3>
          <p className="text-muted-foreground max-w-md">
            Selecione um documento existente na barra lateral ou crie um novo para começar a editar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-editor-bg">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Título do documento..."
            className="text-xl font-semibold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
          {hasUnsavedChanges && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Não salvo
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={cn(
              "gap-2",
              isPreviewMode && "bg-primary text-primary-foreground"
            )}
          >
            {isPreviewMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isPreviewMode ? "Editar" : "Preview"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>

          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="flex-1 overflow-hidden">
        {isPreviewMode ? (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-slate max-w-none dark:prose-invert
                  prose-headings:text-foreground prose-p:text-foreground 
                  prose-strong:text-foreground prose-em:text-foreground
                  prose-code:text-foreground prose-pre:bg-muted
                  prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary
                  prose-a:text-primary hover:prose-a:text-primary/80
                  prose-li:text-foreground prose-td:text-foreground prose-th:text-foreground">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {content || "*Nenhum conteúdo para exibir...*"}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full p-6">
            <div className="h-full max-w-4xl mx-auto">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Digite seu conteúdo em Markdown aqui...

# Título Principal
## Subtítulo

- Lista de itens
- Outro item

**Texto em negrito** e *texto em itálico*

```javascript
// Código com syntax highlighting
console.log('Hello, World!');
```

> Citação de texto

[Link](https://example.com)"
                className="h-full resize-none border-none shadow-none focus-visible:ring-0 text-base leading-relaxed font-mono bg-transparent"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}