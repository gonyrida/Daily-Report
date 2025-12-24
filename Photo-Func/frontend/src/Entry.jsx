export default function Entry({ entry, onUpdate, onDelete }) {
  // Handle image file change
  const handleImageChange = (e, key) => {
    const file = e.target.files[0] || null;
    onUpdate({
      ...entry,
      images: { ...entry.images, [key]: file },
    });
  };

  // Handle footer text change
  const handleFooterChange = (e, index) => {
    const newFooters = [...entry.footers];
    newFooters[index] = e.target.value;
    onUpdate({
      ...entry,
      footers: newFooters,
    });
  };

  return (
    <div style={{ marginTop: 10, padding: 10, border: "1px dashed #aaa" }}>
      <div style={{ marginBottom: 10 }}>
        <label>
          Image col 1:{" "}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, "image1")}
          />
        </label>
        <label style={{ marginLeft: 10 }}>
          Image col 2:{" "}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, "image2")}
          />
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Footer col 1"
          value={entry.footers[0]}
          onChange={(e) => handleFooterChange(e, 0)}
        />
        <input
          placeholder="Footer col 2"
          value={entry.footers[1]}
          onChange={(e) => handleFooterChange(e, 1)}
          style={{ marginLeft: 10 }}
        />
      </div>

      <button onClick={() => onDelete(entry.id)}>Delete Entry</button>
    </div>
  );
}
