import { useState } from "react";
import { Search, FileText, Plus, Folder, FolderOpen, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";

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
  onNewFolder: () => void;
  onNewDocumentInFolder: (folderId: string) => void;
  onSearchChange: (query: string) => void;
  onMoveDocument: (documentId: string, targetFolderId?: string) => void;
  onToggleFolder: (folderId: string) => void;
}

// Draggable Document Component
function DraggableDocument({ 
  document, 
  isActive, 
  onSelect 
}: { 
  document: Document; 
  isActive: boolean; 
  onSelect: () => void; 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: document.id,
    data: { type: 'document', document }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 p-3 rounded-lg mb-1 transition-smooth cursor-pointer",
        "hover:bg-sidebar-hover",
        isActive 
          ? "bg-primary/10 border border-primary/20"
          : "border border-transparent",
        isDragging && "opacity-50"
      )}
      onClick={onSelect}
    >
      <div
        {...listeners}
        {...attributes}
        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
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
  );
}

// Droppable Folder Component
function DroppableFolder({ 
  folder, 
  documents, 
  currentDocumentId, 
  onDocumentSelect, 
  onNewDocumentInFolder, 
  onToggleFolder 
}: { 
  folder: Folder; 
  documents: Document[]; 
  currentDocumentId?: string; 
  onDocumentSelect: (doc: Document) => void; 
  onNewDocumentInFolder: (folderId: string) => void; 
  onToggleFolder: (folderId: string) => void; 
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: folder.id,
    data: { type: 'folder', folder }
  });

  return (
    <div className="mb-2">
      <div
        ref={setNodeRef}
        className={cn(
          "w-full flex items-center justify-between p-2 hover:bg-sidebar-hover rounded-lg transition-smooth",
          isOver && "bg-primary/10 border border-primary/30"
        )}
      >
        <button
          onClick={() => onToggleFolder(folder.id)}
          className="flex items-center gap-2 flex-1"
        >
          {folder.isExpanded ? (
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Folder className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">{folder.name}</span>
        </button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNewDocumentInFolder(folder.id)}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-sidebar-hover transition-opacity"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      
      {folder.isExpanded && (
        <div className="ml-4 mt-1">
          {documents.map((document) => (
            <DraggableDocument
              key={document.id}
              document={document}
              isActive={currentDocumentId === document.id}
              onSelect={() => onDocumentSelect(document)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DocumentSidebar({
  documents,
  folders,
  currentDocumentId,
  onDocumentSelect,
  onNewDocument,
  onNewFolder,
  onNewDocumentInFolder,
  onSearchChange,
  onMoveDocument,
  onToggleFolder,
}: DocumentSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const documentId = active.id as string;
    const targetData = over.data.current;
    
    if (targetData?.type === 'folder') {
      onMoveDocument(documentId, targetData.folder.id);
    } else if (over.id === 'root') {
      onMoveDocument(documentId, undefined);
    }
    
    setActiveId(null);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const documentsInFolder = (folderId?: string) =>
    filteredDocuments.filter(doc => doc.folderId === folderId);

  const documentsWithoutFolder = documentsInFolder(undefined);
  const activeDragDocument = activeId ? documents.find(doc => doc.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full bg-sidebar-bg border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">Documentos</h2>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-sidebar-hover"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onNewDocument}>
                    <FileText className="h-4 w-4 mr-2" />
                    Novo Documento
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onNewFolder}>
                    <Folder className="h-4 w-4 mr-2" />
                    Nova Pasta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
          {/* Root droppable area for documents without folder */}
          <div {...useDroppable({ id: 'root' }).setNodeRef}>
            {documentsWithoutFolder.length > 0 && (
              <div className="mb-4">
                {documentsWithoutFolder.map((document) => (
                  <DraggableDocument
                    key={document.id}
                    document={document}
                    isActive={currentDocumentId === document.id}
                    onSelect={() => onDocumentSelect(document)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Folders */}
          {folders.map((folder) => (
            <DroppableFolder
              key={folder.id}
              folder={folder}
              documents={documentsInFolder(folder.id)}
              currentDocumentId={currentDocumentId}
              onDocumentSelect={onDocumentSelect}
              onNewDocumentInFolder={onNewDocumentInFolder}
              onToggleFolder={onToggleFolder}
            />
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

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragDocument ? (
          <div className="bg-card border border-border rounded-lg p-3 shadow-lg opacity-90">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm text-foreground">
                {activeDragDocument.title || "Documento sem título"}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}