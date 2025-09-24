import { useState } from "react";
import { Search, FileText, Plus, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Folder {
  id: string;
  name: string;
  isExpanded: boolean;
}

interface DocumentSidebarProps {
  documents: Document[];
  folders: Folder[];
  currentDocumentId?: string;
  onDocumentSelect: (document: Document) => void;
  onNewDocument: () => void;
  onSearchChange: (query: string) => void;
}

export function DocumentSidebar({
  documents,
  folders,
  currentDocumentId,
  onDocumentSelect,
  onNewDocument,
  onSearchChange,
}: DocumentSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const documentsInFolder = (folderId?: string) =>
    filteredDocuments.filter(doc => doc.folderId === folderId);

  const documentsWithoutFolder = documentsInFolder(undefined);

  return (
    <div className="h-full bg-sidebar-bg border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Documentos</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewDocument}
            className="h-8 w-8 p-0 hover:bg-sidebar-hover"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-9 bg-background border-border"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Documents without folder */}
        {documentsWithoutFolder.map((document) => (
          <button
            key={document.id}
            onClick={() => onDocumentSelect(document)}
            className={cn(
              "w-full text-left p-3 rounded-lg mb-1 transition-smooth",
              "hover:bg-sidebar-hover",
              currentDocumentId === document.id
                ? "bg-primary/10 border border-primary/20"
                : "border border-transparent"
            )}
          >
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">
                  {document.title || "Documento sem título"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {document.updatedAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          </button>
        ))}

        {/* Folders */}
        {folders.map((folder) => (
          <div key={folder.id} className="mb-2">
            <button className="w-full flex items-center gap-2 p-2 hover:bg-sidebar-hover rounded-lg">
              {folder.isExpanded ? (
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Folder className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">{folder.name}</span>
            </button>
            
            {folder.isExpanded && (
              <div className="ml-4 mt-1">
                {documentsInFolder(folder.id).map((document) => (
                  <button
                    key={document.id}
                    onClick={() => onDocumentSelect(document)}
                    className={cn(
                      "w-full text-left p-2 rounded-lg mb-1 transition-smooth",
                      "hover:bg-sidebar-hover",
                      currentDocumentId === document.id
                        ? "bg-primary/10 border border-primary/20"
                        : "border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs text-foreground truncate">
                          {document.title || "Documento sem título"}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum documento encontrado</p>
            <p className="text-xs mt-1">Clique no + para criar um novo</p>
          </div>
        )}
      </div>
    </div>
  );
}