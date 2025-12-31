import React, { useState, useRef } from "react";
import Entry from "./Entry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Check, X, ImagePlus, Image, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Section({ section, onUpdate, onDelete }: any) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Add a new entry
  const addEntry = () => {
    onUpdate({
      ...section,
      entries: [
        ...section.entries,
        {
          id: crypto.randomUUID(),
          images: { image1: null, image2: null },
          footers: ["", ""],
        },
      ],
    });
  };

  const updateEntry = (updatedEntry: any) => {
    onUpdate({ ...section, entries: section.entries.map((e: any) => (e.id === updatedEntry.id ? updatedEntry : e)) });
  };

  const deleteEntry = (id: string) => {
    onUpdate({ ...section, entries: section.entries.filter((e: any) => e.id !== id) });
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(section.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const cancelDelete = () => setShowDeleteConfirm(false);

  // Bulk upload support: create an entry per uploaded image
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const handleBulkUploadFiles = (files: FileList | null, targetEntryId?: string, targetKey?: string) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast({ description: "No image files selected." });
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const allowed = imageFiles.filter((f) => f.size <= MAX_SIZE);
    const rejectedCount = imageFiles.length - allowed.length;

    if (allowed.length === 0) {
      toast({ description: "All selected images exceed the 10MB limit and were rejected." });
      return;
    }

    // Convert to mutable array
    let remaining = [...allowed];

    // Make a shallow copy of entries and fill target slot first if provided
    const entries = section.entries.map((e: any) => ({ ...e, images: { ...e.images } }));
    let filledCount = 0;

    if (targetEntryId && targetKey) {
      const target = entries.find((en) => en.id === targetEntryId);
      if (target && target.images[targetKey] == null && remaining.length > 0) {
        target.images[targetKey] = remaining.shift() as File;
        filledCount++;
      }
    }

    // Then fill any other entries' empty second slot
    for (let i = 0; i < entries.length && remaining.length > 0; i++) {
      const e = entries[i];
      if (e.images.image2 == null) {
        e.images.image2 = remaining.shift() || null;
        filledCount++;
      }
    }

    // Then: group remaining files into pairs to create new entries
    const newEntries: any[] = [];
    for (let i = 0; i < remaining.length; i += 2) {
      const img1 = remaining[i];
      const img2 = remaining[i + 1] || null;
      newEntries.push({ id: crypto.randomUUID(), images: { image1: img1, image2: img2 }, footers: ["", ""] });
    }

    const addedImages = allowed.length;

    onUpdate({ ...section, entries: [...entries, ...newEntries] });

    toast({
      title: `${addedImages} image(s) processed. ${filledCount ? `${filledCount} filled into existing entries.` : ""}`,
      description: `${newEntries.length} new entr${newEntries.length !== 1 ? "ies" : "y"} created.${rejectedCount ? ` ${rejectedCount} file(s) were too large and skipped.` : ""}`,
    });
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleBulkUploadFiles(e.target.files);
    // Clear input so same files can be re-selected if needed
    e.currentTarget.value = "";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-indigo-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <label htmlFor={`section-title-${section.id}`} className="sr-only">Section Title</label>
            <Input
              id={`section-title-${section.id}`}
              type="text"
              value={section.title}
              onChange={(e) => onUpdate({ ...section, title: e.target.value })}
              placeholder="Enter section title..."
              className="text-lg font-semibold"
              aria-label="Section title"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Bulk upload input (hidden) */}
            <input ref={fileInputRef} onChange={onFileInputChange} type="file" accept="image/*" multiple className="hidden" />

            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              Upload Images
            </Button>

            {showDeleteConfirm ? (
              <>
                <Button variant="destructive" onClick={handleDelete} className="text-sm px-3 py-1.5"><Check className="w-4 h-4 mr-2" />Confirm</Button>
                <Button variant="ghost" onClick={cancelDelete}><X className="w-4 h-4 mr-2" />Cancel</Button>
              </>
            ) : (
              <Button variant="destructive" onClick={handleDelete} className="text-sm px-3 py-1.5"><Trash2 className="w-4 h-4 mr-2" />Delete Section</Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {section.entries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.entries.map((entry: any, index: number) => (
              <div key={entry.id} className="relative">
                <Entry entry={entry} onUpdate={updateEntry} onDelete={deleteEntry} entryNumber={index + 1} onBulkUpload={handleBulkUploadFiles} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Image className="w-12 h-12 mb-2 opacity-50 text-muted-foreground mx-auto" aria-hidden="true" />
            <p className="text-sm">No entries yet. Add your first entry below.</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-6">
          <div className="flex items-center gap-3">
            <input ref={fileInputRef} onChange={onFileInputChange} type="file" accept="image/*" multiple className="hidden" />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              Upload Images
            </Button>
            <p className="text-sm text-muted-foreground">Upload multiple images. Each entry holds up to two images.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={addEntry} className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-white"> 
              <ImagePlus className="w-4 h-4" />
              Add Entry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}