"use client";

import { useState } from "react";
import { uploadImage, createItem, imageUrl, type Item } from "@/lib/api";

export default function Page() {
  const [name, setName] = useState("黒白コート");
  const [file, setFile] = useState<File | null>(null);
  const [created, setCreated] = useState<Item | null>(null);
  const [log, setLog] = useState("");

  const onSubmit = async () => {
    try {
      if (!file) throw new Error("画像ファイルを選んでね");

      setLog("uploading...");
      const image_path = await uploadImage(file);

      setLog(`uploaded: ${image_path}\ncreating item...`);
      const item = await createItem({
        name,
        categories: ["outer"],
        colors: ["black", "white"],
        seasons: ["winter"],
        size: "M",
        material: "wool",
        image_path,
      });

      setCreated(item);
      setLog("done!");
    } catch (e: any) {
      setLog(`error: ${e?.message ?? String(e)}`);
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Closet MVP</h1>

      <div style={{ marginTop: 12 }}>
        <label>名前：</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ border: "1px solid #ccc", padding: 8, width: 280 }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label>画像：</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <button
        onClick={onSubmit}
        style={{ marginTop: 16, padding: "10px 16px", border: "1px solid #333" }}
      >
        アップロード→登録
      </button>

      <pre style={{ marginTop: 16, background: "#f6f6f6", padding: 12 }}>
        {log}
      </pre>

      {created && (
        <div style={{ marginTop: 16 }}>
          <h2>作成結果</h2>
          <div>id: {created.id}</div>
          <div>name: {created.name}</div>
          <div>image_path: {created.image_path}</div>
          <img
            src={imageUrl(created.image_path)}
            alt={created.name}
            style={{ marginTop: 8, maxWidth: 240, border: "1px solid #ddd" }}
          />
          <pre style={{ marginTop: 12, background: "#f6f6f6", padding: 12 }}>
            {JSON.stringify(created, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
