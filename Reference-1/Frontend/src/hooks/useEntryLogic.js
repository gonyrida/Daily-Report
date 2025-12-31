import { useState, useRef, useEffect } from "react";

export function useEntryLogic(entry, onUpdate) {
  const [dragActive, setDragActive] = useState({ image1: false, image2: false });
  const [imageUrls, setImageUrls] = useState({ image1: null, image2: null });
  const fileInputRefs = { image1: useRef(null), image2: useRef(null) };

  // 1. Memory Management (The part you just reminded me of!)
  useEffect(() => {
    const urls = { image1: null, image2: null };
    if (entry.images.image1) urls.image1 = URL.createObjectURL(entry.images.image1);
    if (entry.images.image2) urls.image2 = URL.createObjectURL(entry.images.image2);
    setImageUrls(urls);
    return () => {
      if (urls.image1) URL.revokeObjectURL(urls.image1);
      if (urls.image2) URL.revokeObjectURL(urls.image2);
    };
  }, [entry.images.image1, entry.images.image2]);

  // 2. File Validation & Update Logic
  const processFile = (file, key) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }
    onUpdate({ ...entry, images: { ...entry.images, [key]: file } });
    // Add this: Clear the input value so the same file can be re-uploaded if deleted
    if (fileInputRefs[key].current) fileInputRefs[key].current.value = "";
  };

  // 3. The Handlers
  const handleImageChange = (e, key) => processFile(e.target.files[0], key);

  const handleDrag = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [key]: e.type === "dragenter" || e.type === "dragover" }));
  };

  const handleDrop = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [key]: false }));
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) processFile(file, key);
    }
  };

  const removeImage = (key, e) => {
    e.stopPropagation();
    onUpdate({ ...entry, images: { ...entry.images, [key]: null } });
    if (fileInputRefs[key].current) fileInputRefs[key].current.value = "";
  };

  const handleFooterChange = (e, index) => {
    const newFooters = [...entry.footers];
    newFooters[index] = e.target.value;
    onUpdate({ ...entry, footers: newFooters });
  };

  return {
    dragActive, imageUrls, fileInputRefs,
    handleImageChange, handleDrag, handleDrop, removeImage, handleFooterChange
  };
}