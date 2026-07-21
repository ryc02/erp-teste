import React, { useState, useEffect, useRef } from "react";
import { Type, Image as ImageIcon, Barcode as BarcodeIcon, Trash2, QrCode, User, MapPin, Package, Move } from "lucide-react";
import { Input, Select } from "./SharedUI";

type FieldType = 
  | "sku" 
  | "name" 
  | "gtin" 
  | "custom" 
  | "barcode" 
  | "logo" 
  | "pedido_id" 
  | "cliente_nome" 
  | "remetente_nome" 
  | "endereco_destino" 
  | "qrcode";

interface LabelField {
  id: string;
  type: FieldType;
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
  align?: "left" | "center" | "right";
  customText?: string;
}

function generateZPL(fields: LabelField[], widthMm: number, heightMm: number): string {
  let zpl = `^XA\n^PW${Math.round(widthMm * 8)}\n^LL${Math.round(heightMm * 8)}\n`;
  fields.forEach(f => {
    const xDot = Math.round(f.x * 8);
    const yDot = Math.round(f.y * 8);
    const fontH = Math.round((f.fontSize || 10) * 2.5);
    
    if (f.type === "barcode") {
      zpl += `^FO${xDot},${yDot}^BY2,3,${Math.round(f.h * 8)}^BCN,,Y,N^FD{{pedido_id}}^FS\n`;
    } else if (f.type === "qrcode") {
      zpl += `^FO${xDot},${yDot}^BQN,2,4^FDMM,A{{url_rastreamento}}^FS\n`;
    } else if (f.type === "logo") {
      zpl += `^FO${xDot},${yDot}^A0N,${fontH*1.5},${fontH*1.5}^FDVENNER^FS\n`;
    } else {
      let val = `{{${f.type}}}`;
      if (f.type === "custom") val = f.customText || "Texto";
      zpl += `^FO${xDot},${yDot}^A0N,${fontH},${fontH}^FD${val}^FS\n`;
    }
  });
  zpl += "^XZ";
  return zpl;
}

export function EtiquetaVisualEditor({ 
  template, 
  onChange 
}: { 
  template: any, 
  onChange: (tmpl: any) => void 
}) {
  const [fields, setFields] = useState<LabelField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRawMode, setIsRawMode] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const scale = 4;
  const widthPx = (template.largura_mm || 100) * scale;
  const heightPx = (template.altura_mm || 40) * scale;

  useEffect(() => {
    if (template.campos_json) {
      try {
        const parsed = JSON.parse(template.campos_json);
        if (Array.isArray(parsed)) {
          setFields(parsed);
          return;
        }
      } catch (e) {
        console.error("Erro ao parsear campos_json", e);
      }
    }
  }, [template.campos_json]);

  const saveFields = (newFields: LabelField[]) => {
    setFields(newFields);
    const zpl = generateZPL(newFields, template.largura_mm || 100, template.altura_mm || 40);
    onChange({ ...template, campos_json: JSON.stringify(newFields), zpl_base: zpl });
  };

  const addField = (type: FieldType) => {
    const newField: LabelField = {
      id: Math.random().toString(36).substring(7),
      type,
      x: 5,
      y: 5,
      w: type === "barcode" || type === "endereco_destino" ? 60 : 40,
      h: type === "barcode" ? 18 : type === "qrcode" ? 20 : 6,
      fontSize: 10,
      align: "left",
      customText: type === "custom" ? "Texto Livre" : ""
    };
    saveFields([...fields, newField]);
    setSelectedId(newField.id);
  };

  const updateField = (id: string, updates: Partial<LabelField>) => {
    saveFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id: string) => {
    saveFields(fields.filter(f => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const getPlaceholder = (type: FieldType, customText?: string) => {
    switch(type) {
      case "sku": return "SKU: PRD-0001";
      case "name": return "Nome do Produto";
      case "gtin": return "7891000315507";
      case "pedido_id": return "PEDIDO #1024";
      case "cliente_nome": return "DESTINATÁRIO: João Silva";
      case "remetente_nome": return "REMETENTE: Empresa Venner LTDA";
      case "endereco_destino": return "Av. Paulista, 1000 - São Paulo/SP";
      case "custom": return customText || "Texto Livre";
      default: return "";
    }
  };

  const selectedField = fields.find(f => f.id === selectedId);

  // Mouse Dragging implementation
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    setDraggingId(id);
    const field = fields.find(f => f.id === id);
    if (!field || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - (canvasRect.left + field.x * scale),
      y: e.clientY - (canvasRect.top + field.y * scale)
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingId || !canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      let newX = Math.round((e.clientX - canvasRect.left - dragOffset.x) / scale);
      let newY = Math.round((e.clientY - canvasRect.top - dragOffset.y) / scale);

      newX = Math.max(0, Math.min(newX, (template.largura_mm || 100) - 10));
      newY = Math.max(0, Math.min(newY, (template.altura_mm || 40) - 5));

      setFields(prev => prev.map(f => f.id === draggingId ? { ...f, x: newX, y: newY } : f));
    };

    const handleMouseUp = () => {
      if (draggingId) {
        setDraggingId(null);
        saveFields(fields);
      }
    };

    if (draggingId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingId, dragOffset]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs text-muted-foreground">Clique e arraste os elementos para ajustar a posição na etiqueta em tempo real.</p>
        <button 
          onClick={() => setIsRawMode(!isRawMode)} 
          className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted text-foreground font-medium"
        >
          {isRawMode ? "Ver Editor Visual Drag-and-Drop" : "Ver Código ZPL Gerado"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Input label="Largura (mm)" type="number" value={template.largura_mm || 100} onChange={e => onChange({...template, largura_mm: +e.target.value})} />
        <Input label="Altura (mm)" type="number" value={template.altura_mm || 40} onChange={e => onChange({...template, altura_mm: +e.target.value})} />
      </div>

      {!isRawMode ? (
        <div className="flex gap-6 items-start">
          {/* Toolbar */}
          <div className="w-60 space-y-2 bg-card p-4 rounded-xl border border-border flex-shrink-0 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Campos de Expedição</h4>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button onClick={() => addField("pedido_id")} className="flex items-center gap-2 px-3 py-2 bg-muted/40 hover:bg-muted border border-border rounded-lg font-medium text-left"><Package size={14} className="text-primary" /> Nº do Pedido</button>
              <button onClick={() => addField("cliente_nome")} className="flex items-center gap-2 px-3 py-2 bg-muted/40 hover:bg-muted border border-border rounded-lg font-medium text-left"><User size={14} className="text-blue-500" /> Nome Destinatário</button>
              <button onClick={() => addField("endereco_destino")} className="flex items-center gap-2 px-3 py-2 bg-muted/40 hover:bg-muted border border-border rounded-lg font-medium text-left"><MapPin size={14} className="text-amber-500" /> Endereço Completo</button>
              <button onClick={() => addField("remetente_nome")} className="flex items-center gap-2 px-3 py-2 bg-muted/40 hover:bg-muted border border-border rounded-lg font-medium text-left"><User size={14} className="text-emerald-500" /> Dados Remetente</button>
              <button onClick={() => addField("barcode")} className="flex items-center gap-2 px-3 py-2 bg-muted/40 hover:bg-muted border border-border rounded-lg font-medium text-left"><BarcodeIcon size={14} /> Código de Barras</button>
              <button onClick={() => addField("qrcode")} className="flex items-center gap-2 px-3 py-2 bg-muted/40 hover:bg-muted border border-border rounded-lg font-medium text-left"><QrCode size={14} /> QR Code Rastreio</button>
              <button onClick={() => addField("sku")} className="flex items-center gap-2 px-3 py-2 bg-muted/40 hover:bg-muted border border-border rounded-lg font-medium text-left"><Type size={14} /> SKU Produto</button>
              <button onClick={() => addField("logo")} className="flex items-center gap-2 px-3 py-2 bg-muted/40 hover:bg-muted border border-border rounded-lg font-medium text-left"><ImageIcon size={14} /> Logo Venner</button>
              <button onClick={() => addField("custom")} className="flex items-center gap-2 px-3 py-2 bg-muted/40 hover:bg-muted border border-border rounded-lg font-medium text-left"><Type size={14} /> Texto Livre</button>
            </div>
          </div>

          {/* Canvas Editor */}
          <div className="flex-1 overflow-auto bg-muted/20 p-6 border border-border rounded-xl flex items-center justify-center min-h-[420px]">
            <div 
              ref={canvasRef}
              className="relative bg-white shadow-lg border-2 border-gray-400 rounded-sm select-none"
              style={{ width: widthPx, height: heightPx, overflow: 'hidden' }}
              onClick={() => setSelectedId(null)}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#999 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.2 }}></div>
              
              {fields.map(f => {
                const isSelected = selectedId === f.id;
                
                let content;
                if (f.type === "barcode") {
                  content = <div className="w-full h-full border border-black border-dashed flex items-center justify-center bg-black/5 font-mono text-[9px] font-bold">||||||| #PEDIDO |||||||</div>;
                } else if (f.type === "qrcode") {
                  content = <div className="w-full h-full border border-black flex items-center justify-center bg-black/10"><QrCode size={20} /></div>;
                } else if (f.type === "logo") {
                  content = <div className="w-full h-full flex flex-col items-center justify-center font-bold text-gray-900 bg-gray-200 text-xs tracking-widest">VENNER</div>;
                } else {
                  content = <div className="w-full truncate font-medium text-gray-900" style={{ textAlign: f.align || "left", fontSize: `${(f.fontSize || 10) * scale * 0.3}px` }}>{getPlaceholder(f.type, f.customText)}</div>;
                }

                return (
                  <div
                    key={f.id}
                    onMouseDown={(e) => handleMouseDown(e, f.id)}
                    className={`absolute cursor-move flex items-center p-1 rounded transition-shadow ${isSelected ? 'ring-2 ring-primary bg-primary/10 z-20 shadow-md' : 'hover:ring-1 hover:ring-gray-400'}`}
                    style={{
                      left: f.x * scale,
                      top: f.y * scale,
                      width: f.w * scale,
                      height: f.h * scale,
                    }}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Properties Panel */}
          {selectedField && (
            <div className="w-64 space-y-4 bg-card p-4 rounded-xl border border-border flex-shrink-0 shadow-sm">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h4 className="text-xs font-bold uppercase text-foreground">{selectedField.type.replace('_', ' ')}</h4>
                <button onClick={() => deleteField(selectedField.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
              </div>

              {selectedField.type === "custom" && (
                <Input label="Texto Personalizado" value={selectedField.customText || ""} onChange={e => updateField(selectedField.id, { customText: e.target.value })} />
              )}

              <div className="grid grid-cols-2 gap-2 text-xs">
                <Input label="Posição X (mm)" type="number" value={selectedField.x} onChange={e => updateField(selectedField.id, { x: +e.target.value })} />
                <Input label="Posição Y (mm)" type="number" value={selectedField.y} onChange={e => updateField(selectedField.id, { y: +e.target.value })} />
                <Input label="Largura (mm)" type="number" value={selectedField.w} onChange={e => updateField(selectedField.id, { w: +e.target.value })} />
                <Input label="Altura (mm)" type="number" value={selectedField.h} onChange={e => updateField(selectedField.id, { h: +e.target.value })} />
              </div>

              {selectedField.type !== "barcode" && selectedField.type !== "qrcode" && selectedField.type !== "logo" && (
                <>
                  <Input label="Tamanho da Fonte" type="number" value={selectedField.fontSize || 10} onChange={e => updateField(selectedField.id, { fontSize: +e.target.value })} />
                  <Select label="Alinhamento" value={selectedField.align || "left"} onChange={(e: any) => updateField(selectedField.id, { align: e.target.value })}>
                    <option value="left">Esquerda</option>
                    <option value="center">Centro</option>
                    <option value="right">Direita</option>
                  </Select>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase text-foreground">
            Código ZPL Gerado Automaticamente
          </label>
          <textarea 
            rows={14}
            value={template.zpl_base || ""} 
            onChange={(e: any) => onChange({...template, zpl_base: e.target.value})}
            className="w-full font-mono text-xs bg-muted/40 p-3 border border-border rounded-lg text-foreground focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

export default EtiquetaVisualEditor;
