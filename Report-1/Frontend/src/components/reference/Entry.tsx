import React from "react";
import ImageUploadArea from "./ImageUploadArea";
import { useReferenceEntryLogic } from "../../hooks/useReferenceEntryLogic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

export default function Entry({ entry, onUpdate, onDelete, entryNumber, onBulkUpload }: any) {
  const logic = useReferenceEntryLogic(entry, onUpdate, onBulkUpload);

  return (
    <div className="relative mb-12 last:mb-0">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Entry {entryNumber}</h3>
        <Button variant="ghost" onClick={() => onDelete(entry.id)} className="text-red-500 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </Button> 
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageUploadArea
          label="Photo 1"
          imageKey="image1"
          footerIndex={0}
          entry={entry}
          imageUrl={logic.imageUrls.image1}
          isDragActive={logic.dragActive.image1}
          fileInputRefs={logic.fileInputRefs}
          handleDrag={logic.handleDrag}
          handleDrop={logic.handleDrop}
          handleImageChange={logic.handleImageChange}
          removeImage={logic.removeImage}
          handleFooterChange={logic.handleFooterChange}
        />

        <ImageUploadArea
          label="Photo 2"
          imageKey="image2"
          footerIndex={1}
          entry={entry}
          imageUrl={logic.imageUrls.image2}
          isDragActive={logic.dragActive.image2}
          fileInputRefs={logic.fileInputRefs}
          handleDrag={logic.handleDrag}
          handleDrop={logic.handleDrop}
          handleImageChange={logic.handleImageChange}
          removeImage={logic.removeImage}
          handleFooterChange={logic.handleFooterChange}
        />
      </div>
    </div>
  );
}