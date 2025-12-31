import React from "react";
import SectionList from "./reference/SectionList";
import { createReferenceSection } from "@/utils/referenceHelpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image, PlusCircle } from "lucide-react";

interface Props {
  sections: any[];
  setSections: (s: any[]) => void;
}

export default function ReferenceSection({ sections, setSections }: Props) {
  const addSection = () => setSections([...sections, createReferenceSection()]);

  const updateSection = (updated: any) => setSections(sections.map((s) => (s.id === updated.id ? updated : s)));

  const deleteSection = (id: string) => setSections(sections.filter((s) => s.id !== id));

  return (
    <div className="section-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Image className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Reference</h2>
            <p className="text-sm text-muted-foreground">Reference images and captions (will map to Sheet 2)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">Sheet 2</Badge>
          <Button onClick={addSection} className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2"><PlusCircle className="w-4 h-4" />Add Section</Button>
        </div>
      </div>

      <div className="mt-4">
        <SectionList sections={sections} onUpdate={updateSection} onDelete={deleteSection} onAdd={addSection} />
      </div>
    </div>
  );
}