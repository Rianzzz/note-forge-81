import { useState, useEffect } from "react";
import { DocumentSidebar } from "@/components/DocumentSidebar";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { toast } from "@/hooks/use-toast";

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

export default function DocumentationApp() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | undefined>();
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);

  // Initialize with sample data
  useEffect(() => {
    const sampleDocuments: Document[] = [
      {
        id: "1",
        title: "Bem-vindo ao Editor",
        content: `# Bem-vindo ao Editor de Documentação 📚

Este é um editor de documentação colaborativa inspirado no Notion, onde você pode criar e organizar seus documentos em Markdown.

## Funcionalidades Principais

- ✍️ **Editor em tempo real**: Digite em Markdown e veja a formatação instantaneamente
- 📁 **Organização**: Organize seus documentos em pastas
- 🔍 **Busca inteligente**: Encontre documentos rapidamente
- 💾 **Salvamento automático**: Suas alterações são preservadas
- 📥 **Exportação**: Baixe seus documentos em formato Markdown

## Como usar

1. **Criar documento**: Clique no botão + na barra lateral
2. **Editar**: Use Markdown para formatar seu texto
3. **Preview**: Clique em "Preview" para ver como ficará formatado
4. **Salvar**: Clique em "Salvar" ou use Ctrl+S
5. **Exportar**: Use o botão "Exportar" para baixar em .md

## Sintaxe Markdown Suportada

### Títulos
\`\`\`markdown
# Título 1
## Título 2
### Título 3
\`\`\`

### Formatação de texto
- **Negrito** ou __negrito__
- *Itálico* ou _itálico_
- \`código inline\`
- ~~riscado~~

### Listas
1. Lista numerada
2. Segundo item

- Lista com marcadores
- Outro item

### Links e Imagens
[Link para o Google](https://google.com)

### Código
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Citações
> Esta é uma citação
> Pode ter múltiplas linhas

### Tabelas
| Coluna 1 | Coluna 2 |
|----------|----------|
| Dado 1   | Dado 2   |

## Dicas
- Use Ctrl+S para salvar rapidamente
- O preview atualiza em tempo real
- Organize seus documentos em pastas para melhor organização

Comece criando seu primeiro documento! 🚀`,
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        id: "2",
        title: "Guia de Markdown",
        content: `# Guia Completo de Markdown

## Sintaxe Básica

### Parágrafos
Para criar parágrafos, deixe uma linha em branco entre os textos.

### Quebras de linha
Para quebrar linha sem criar novo parágrafo,  
adicione dois espaços no final da linha.

## Formatação Avançada

### Listas Aninhadas
1. Primeiro item
   - Subitem 1
   - Subitem 2
2. Segundo item
   1. Subitem numerado
   2. Outro subitem

### Links com Referência
[Google][1]
[GitHub][2]

[1]: https://google.com
[2]: https://github.com

### Código com Destaque
\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

### Elementos HTML
<details>
<summary>Clique para expandir</summary>

Conteúdo oculto que pode ser revelado.

</details>

## Extensões GitHub Flavored Markdown

### Tabelas com Alinhamento
| Esquerda | Centro | Direita |
|:---------|:------:|--------:|
| Texto    | Texto  | Texto   |

### Lista de Tarefas
- [x] Tarefa concluída
- [ ] Tarefa pendente
- [ ] Outra tarefa

### Emojis
:rocket: :book: :bulb: :heart:

### Menções e Issues
@usuario #123 (quando conectado ao GitHub)

## Dicas de Produtividade

1. **Use títulos hierárquicos**: Organize com H1, H2, H3...
2. **Abuse das listas**: Facilitam a leitura
3. **Código sempre destacado**: Use \`backticks\`
4. **Links descritivos**: "Clique aqui" não é bom
5. **Imagens com alt text**: Para acessibilidade

Bom trabalho! 📝`,
        createdAt: new Date("2024-01-16"),
        updatedAt: new Date("2024-01-16"),
      },
    ];

    const sampleFolders: Folder[] = [
      { id: "1", name: "Projetos", isExpanded: true },
      { id: "2", name: "Tutoriais", isExpanded: false },
      { id: "3", name: "Rascunhos", isExpanded: true },
    ];

    setDocuments(sampleDocuments);
    setFolders(sampleFolders);
    setFilteredDocuments(sampleDocuments);
    setCurrentDocument(sampleDocuments[0]);
  }, []);

  const handleDocumentSelect = (document: Document) => {
    setCurrentDocument(document);
  };

  const handleNewDocument = () => {
    const newDocument: Document = {
      id: Date.now().toString(),
      title: "",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDocuments(prev => [newDocument, ...prev]);
    setFilteredDocuments(prev => [newDocument, ...prev]);
    setCurrentDocument(newDocument);
    
    toast({
      title: "Novo documento criado",
      description: "Comece a digitar para adicionar conteúdo.",
    });
  };

  const handleNewDocumentInFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    const newDocument: Document = {
      id: Date.now().toString(),
      title: "",
      content: "",
      folderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDocuments(prev => [newDocument, ...prev]);
    setFilteredDocuments(prev => [newDocument, ...prev]);
    setCurrentDocument(newDocument);
    
    toast({
      title: "Novo documento criado",
      description: `Documento criado na pasta "${folder?.name}".`,
    });
  };

  const handleSave = (title: string, content: string) => {
    if (!currentDocument) return;

    const updatedDocument: Document = {
      ...currentDocument,
      title: title || "Documento sem título",
      content,
      updatedAt: new Date(),
    };

    setDocuments(prev =>
      prev.map(doc => doc.id === currentDocument.id ? updatedDocument : doc)
    );
    
    setFilteredDocuments(prev =>
      prev.map(doc => doc.id === currentDocument.id ? updatedDocument : doc)
    );
    
    setCurrentDocument(updatedDocument);
    
    toast({
      title: "Documento salvo",
      description: "Suas alterações foram salvas com sucesso.",
    });
  };

  const handleTitleChange = (title: string) => {
    if (!currentDocument) return;

    const updatedDocument = { ...currentDocument, title };
    setCurrentDocument(updatedDocument);
  };

  const handleMoveDocument = (documentId: string, targetFolderId?: string) => {
    const updatedDocuments = documents.map(doc => 
      doc.id === documentId 
        ? { ...doc, folderId: targetFolderId, updatedAt: new Date() }
        : doc
    );
    
    setDocuments(updatedDocuments);
    setFilteredDocuments(updatedDocuments);
    
    const targetFolder = folders.find(f => f.id === targetFolderId);
    const targetName = targetFolder ? `pasta "${targetFolder.name}"` : "raiz";
    
    toast({
      title: "Documento movido",
      description: `Documento movido para ${targetName}.`,
    });
  };

  const handleToggleFolder = (folderId: string) => {
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, isExpanded: !folder.isExpanded }
          : folder
      )
    );
  };

  const handleSearchChange = (query: string) => {
    if (!query.trim()) {
      setFilteredDocuments(documents);
      return;
    }

    const filtered = documents.filter(doc =>
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.content.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDocuments(filtered);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <DocumentSidebar
          documents={filteredDocuments}
          folders={folders}
          currentDocumentId={currentDocument?.id}
          onDocumentSelect={handleDocumentSelect}
          onNewDocument={handleNewDocument}
          onNewDocumentInFolder={handleNewDocumentInFolder}
          onSearchChange={handleSearchChange}
          onMoveDocument={handleMoveDocument}
          onToggleFolder={handleToggleFolder}
        />
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 overflow-hidden">
        <MarkdownEditor
          document={currentDocument}
          onSave={handleSave}
          onTitleChange={handleTitleChange}
        />
      </div>
    </div>
  );
}