import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types";
import { Container, Heading, Button, Label, toast, Badge } from "@medusajs/ui";
import { useState, useEffect, useRef } from "react";
import { Plus, Trash, ChevronUpMini, ChevronDownMini, Check, DocumentText } from "@medusajs/icons";

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

interface WysiwygEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const WysiwygEditor = ({ value, onChange, placeholder }: WysiwygEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync internal HTML with external value
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command: string, argVal: string = '') => {
    document.execCommand(command, false, argVal);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className={`rounded-lg border transition-all ${isFocused ? 'border-gray-900 ring-1 ring-gray-900 shadow-sm' : 'border-gray-300'} bg-white overflow-hidden`}>
      {/* WYSIWYG Toolbar */}
      <div className="flex items-center flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200 select-none">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }}
          className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 font-extrabold text-xs text-gray-900 shadow-2xs cursor-pointer"
          title="Bold (B)"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }}
          className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 italic font-serif text-xs text-gray-900 shadow-2xs cursor-pointer"
          title="Italic (I)"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand('underline'); }}
          className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 underline text-xs text-gray-900 shadow-2xs cursor-pointer"
          title="Underline (U)"
        >
          U
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand('insertUnorderedList'); }}
          className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-800 shadow-2xs cursor-pointer"
          title="Bullet List"
        >
          • Bullet List
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand('insertOrderedList'); }}
          className="px-2.5 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-800 shadow-2xs cursor-pointer"
          title="Numbered List"
        >
          1. Numbered List
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<h3>'); }}
          className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs font-bold text-gray-800 shadow-2xs cursor-pointer"
          title="Heading"
        >
          H3
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<p>'); }}
          className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs text-gray-800 shadow-2xs cursor-pointer"
          title="Paragraph"
        >
          P
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand('removeFormat'); }}
          className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 text-xs text-gray-500 shadow-2xs cursor-pointer ml-auto"
          title="Clear Formatting"
        >
          Clear
        </button>
      </div>

      {/* WYSIWYG Content Editable Input Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="p-3.5 text-sm text-gray-900 caret-black leading-relaxed min-h-[140px] max-h-[350px] overflow-y-auto outline-none font-sans [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_h3]:font-bold [&_h3]:text-base [&_p]:mb-2"
        style={{ color: '#111827', backgroundColor: '#ffffff', caretColor: '#000000' }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

const ProductAccordionsWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const [items, setItems] = useState<AccordionItem[]>([]);
  const [initialKeys, setInitialKeys] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize accordion items from product metadata
  useEffect(() => {
    if (!data || !data.metadata) {
      setItems([]);
      setInitialKeys([]);
      return;
    }

    const loadedItems: AccordionItem[] = [];
    const keys: string[] = [];
    
    // Convert existing metadata object into array of title + content
    Object.entries(data.metadata).forEach(([key, val], idx) => {
      if (key === 'custom_sections' || key === 'feature_sections') return;
      if (!val || val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) return;

      keys.push(key);

      let contentStr = '';
      if (typeof val === 'string') {
        contentStr = val;
      } else if (typeof val === 'number' || typeof val === 'boolean') {
        contentStr = String(val);
      } else if (Array.isArray(val)) {
        if (val.every(v => typeof v === 'string')) {
          contentStr = `<ul>${val.map(v => `<li>${v}</li>`).join('')}</ul>`;
        } else {
          contentStr = JSON.stringify(val, null, 2);
        }
      } else if (typeof val === 'object' && val !== null) {
        contentStr = JSON.stringify(val, null, 2);
      }

      loadedItems.push({
        id: `acc-${idx}-${Date.now()}`,
        title: key,
        content: contentStr,
      });
    });

    setInitialKeys(keys);

    if (loadedItems.length === 0) {
      // Default starter templates for any product
      setItems([
        { id: 'acc-1', title: 'Key Features', content: '<ul><li>41,000 VPM Sonic Motor</li><li>Medical-Grade Antimicrobial Silicone</li><li>60-Day Battery Life</li></ul>' },
        { id: 'acc-2', title: 'Warranty', content: '<p>24-Month Limited Warranty covering device hardware and defects.</p>' },
        { id: 'acc-3', title: 'Shipping & Delivery', content: '<p>Free standard global delivery on orders over £50.</p>' },
      ]);
    } else {
      setItems(loadedItems);
    }
  }, [data]);

  const handleAddItem = () => {
    const newItem: AccordionItem = {
      id: `acc-new-${Date.now()}`,
      title: 'New Accordion Title',
      content: '',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: 'title' | 'content', value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setItems(newItems);
  };

  const handleSave = async () => {
    if (!data?.id) return;
    setIsSaving(true);

    try {
      // Build updated metadata object from active accordion items
      const updatedMetadata: Record<string, any> = {};
      const currentActiveKeys = new Set<string>();

      items.forEach(item => {
        const cleanTitle = item.title.trim();
        if (cleanTitle.length > 0) {
          updatedMetadata[cleanTitle] = item.content;
          currentActiveKeys.add(cleanTitle);
        }
      });

      // Crucial: Set any previously existing key that was deleted to NULL so Medusa deletes it from DB!
      initialKeys.forEach(prevKey => {
        if (prevKey !== 'custom_sections' && prevKey !== 'feature_sections' && !currentActiveKeys.has(prevKey)) {
          updatedMetadata[prevKey] = null;
        }
      });

      const response = await fetch(`/admin/products/${data.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: updatedMetadata,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to save accordions: ${response.statusText}`);
      }

      toast.success("Accordions saved!", {
        description: "Product metadata accordions updated successfully for storefront.",
      });

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err: any) {
      toast.error("Save failed", {
        description: err.message || "Could not save metadata accordions.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container className="p-6 bg-white border border-gray-200 rounded-xl shadow-xs space-y-6 my-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gray-900 text-white">
            <DocumentText className="w-5 h-5 text-white" />
          </div>
          <div>
            <Heading level="h2" className="text-lg font-bold text-gray-900">
              Product Accordions WYSIWYG Manager
            </Heading>
            <p className="text-xs text-gray-500 mt-0.5">
              Format accordions with rich text, bold labels, and bullet lists. Changes save directly to database & storefront.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            size="small" 
            onClick={handleAddItem}
            className="gap-1.5 border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" /> Add Accordion
          </Button>
          <Button 
            variant="primary" 
            size="small" 
            onClick={handleSave} 
            isLoading={isSaving}
            className="gap-1.5 bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-2"
          >
            <Check className="w-4 h-4" /> Save Accordions
          </Button>
        </div>
      </div>

      {/* Accordion Cards List */}
      {items.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 bg-gray-50">
          <p className="text-sm font-medium text-gray-600">No accordions defined for this product.</p>
          <Button variant="secondary" size="small" onClick={handleAddItem} className="mt-3">
            <Plus className="w-4 h-4 mr-1" /> Add Your First Accordion
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className="p-5 rounded-xl border border-gray-300 bg-white shadow-xs space-y-4 transition-all hover:border-gray-400"
            >
              {/* Header Controls */}
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex-1 max-w-md">
                  <Label className="text-xs font-semibold text-gray-700 mb-1 block">
                    Accordion Title (Heading)
                  </Label>
                  <input 
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                    placeholder="e.g. Key Features, Warranty, Shipping"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 caret-black focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 shadow-2xs block"
                    style={{ color: '#111827', backgroundColor: '#ffffff', caretColor: '#000000' }}
                  />
                </div>

                <div className="flex items-center gap-1.5 pt-4">
                  <Badge color="grey" size="small" className="font-mono text-xs">#{index + 1}</Badge>
                  <Button
                    variant="transparent"
                    size="small"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    title="Move Up"
                    className="p-1 hover:bg-gray-100"
                  >
                    <ChevronUpMini className="w-4 h-4 text-gray-700" />
                  </Button>
                  <Button
                    variant="transparent"
                    size="small"
                    disabled={index === items.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    title="Move Down"
                    className="p-1 hover:bg-gray-100"
                  >
                    <ChevronDownMini className="w-4 h-4 text-gray-700" />
                  </Button>
                  <Button
                    variant="transparent"
                    size="small"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Delete Accordion"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 font-medium"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* WYSIWYG Rich Text Editor */}
              <div>
                <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  Accordion Content (WYSIWYG Editor — Bold, Italic, Bullet Lists, Paragraphs)
                </Label>
                <WysiwygEditor 
                  value={item.content}
                  onChange={(val) => handleUpdateItem(item.id, 'content', val)}
                  placeholder="Type accordion content here... Use toolbar to format bold, italic, or bullet points."
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default ProductAccordionsWidget;
