export function createReferenceSection() {
  return {
    id: crypto.randomUUID(),
    title: "New Section",
    entries: [
      {
        id: crypto.randomUUID(),
        images: { image1: null, image2: null },
        footers: ["", ""],
      },
    ],
  };
}

export const validateReferenceSections = (sections: any[]) => {
  return sections.some(
    (section) =>
      section.title.trim() &&
      section.entries.some(
        (entry: any) =>
          (entry.images.image1 || entry.images.image2) ||
          entry.footers.some((footer: string) => footer.trim())
      )
  );
};