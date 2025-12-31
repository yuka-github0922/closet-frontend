"use client";

import { useMemo, useState } from "react";
import { uploadImage, createItem, imageUrl, deleteItem, type Item } from "@/lib/api";

import { useEffect } from "react";
import { getItems } from "@/lib/api";
// ★ backendのEnum値に合わせる（ここ超大事）
// 例：あなたのEnum定義に合わせて増やしてOK
const CATEGORY_OPTIONS = [
  { value: "outer", label: "アウター" },
  { value: "tops", label: "トップス" },
  { value: "bottoms", label: "ボトムス" },
  { value: "shoes", label: "シューズ" },
] as const;

const COLOR_OPTIONS = [
  { value: "black", label: "黒" },
  { value: "white", label: "白" },
  { value: "beige", label: "ベージュ" },
  { value: "navy", label: "ネイビー" },
] as const;

const SEASON_OPTIONS = [
  { value: "spring", label: "春" },
  { value: "summer", label: "夏" },
  { value: "autumn", label: "秋" },
  { value: "winter", label: "冬" },
] as const;

function ToggleGroup({
  title,
  options,
  values,
  onChange,
}: {
  title: string;
  options: readonly { value: string; label: string }[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const set = useMemo(() => new Set(values), [values]);

  const toggle = (v: string) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange(Array.from(next));
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map((o) => {
          const active = set.has(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              style={{
                padding: "6px 10px",
                border: "1px solid #333",
                borderRadius: 999,
                background: active ? "#333" : "#fff",
                color: active ? "#fff" : "#333",
                cursor: "pointer",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  const [name, setName] = useState("黒白コート");
  const [size, setSize] = useState("M");
  const [material, setMaterial] = useState("wool");
  const [categories, setCategories] = useState<string[]>(["outer"]);
  const [colors, setColors] = useState<string[]>(["black", "white"]);
  const [seasons, setSeasons] = useState<string[]>(["winter"]);
  const [items, setItems] = useState<Item[]>([]);

  const [file, setFile] = useState<File | null>(null);
  const [created, setCreated] = useState<Item | null>(null);
  const [log, setLog] = useState("");

  useEffect(() => {
  getItems()
    .then(setItems)
    .catch((e) => setLog(`load error: ${e.message}`));
}, []);

  const onSubmit = async () => {
    try {
      // バリデーション（最小）
      if (!name.trim()) throw new Error("name は必須");
      if (!file) throw new Error("画像ファイルを選んでね");
      if (categories.length === 0) throw new Error("カテゴリは1つ以上選んでね");
      if (colors.length === 0) throw new Error("色は1つ以上選んでね");
      if (seasons.length === 0) throw new Error("季節は1つ以上選んでね");

      setLog("uploading...");
      const image_path = await uploadImage(file);

      setLog(`uploaded: ${image_path}\ncreating item...`);
      const item = await createItem({
        name,
        categories,
        colors,
        seasons,
        size,
        material,
        image_path,
      });

      setCreated(item);
      setLog("done!");
    } catch (e: any) {
      setLog(`error: ${e?.message ?? String(e)}`);
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 720 }}>
      <h1>Closet MVP</h1>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: "block", fontWeight: 700 }}>名前</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ border: "1px solid #ccc", padding: 8, width: "100%" }}
        />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontWeight: 700 }}>サイズ</label>
          <input
            value={size}
            onChange={(e) => setSize(e.target.value)}
            style={{ border: "1px solid #ccc", padding: 8, width: "100%" }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontWeight: 700 }}>素材</label>
          <input
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            style={{ border: "1px solid #ccc", padding: 8, width: "100%" }}
          />
        </div>
      </div>

      <ToggleGroup
        title={`カテゴリ（${categories.length}）`}
        options={CATEGORY_OPTIONS}
        values={categories}
        onChange={setCategories}
      />

      <ToggleGroup
        title={`色（${colors.length}）`}
        options={COLOR_OPTIONS}
        values={colors}
        onChange={setColors}
      />

      <ToggleGroup
        title={`季節（${seasons.length}）`}
        options={SEASON_OPTIONS}
        values={seasons}
        onChange={setSeasons}
      />

      <div style={{ marginTop: 12 }}>
        <label style={{ fontWeight: 700 }}>画像</label>
        <div style={{ marginTop: 6 }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <button
        onClick={onSubmit}
        style={{
          marginTop: 16,
          padding: "10px 16px",
          border: "1px solid #333",
          cursor: "pointer",
        }}
      >
        アップロード→登録
      </button>

      <pre style={{ marginTop: 16, background: "#f6f6f6", padding: 12 }}>
        {log}
      </pre>

      {created && (
        <div style={{ marginTop: 16 }}>
          <h2>作成結果</h2>

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <img
              src={imageUrl(created.image_path)}
              alt={created.name}
              width={240}
              height={240}
              style={{ border: "1px solid #ddd", objectFit: "cover" }}
            />

            <pre style={{ background: "#f6f6f6", padding: 12, flex: 1 }}>
              {JSON.stringify(created, null, 2)}
            </pre>
          </div>
        </div>
      )}
      {items.length > 0 && (
  <section style={{ marginTop: 32 }}>
    <h2>登録済みアイテム一覧</h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 16,
        marginTop: 12,
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ddd",
            padding: 8,
            borderRadius: 8,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl(item.image_path)}
            alt={item.name}
            style={{
              width: "100%",
              height: 160,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />

          <button
            onClick={async () => {
              await deleteItem(item.id);
              const latest = await getItems();
              setItems(latest);
            }}
          >
            削除
          </button>

          <div style={{ marginTop: 8, fontWeight: 700 }}>
            {item.name}
          </div>

          <div style={{ fontSize: 12, color: "#555" }}>
            {item.categories.join(", ")}
          </div>

          <div style={{ fontSize: 12, color: "#777" }}>
            {item.seasons.join(", ")}
          </div>
        </div>
      ))}
    </div>
  </section>
)}

    </main>
  );
}
