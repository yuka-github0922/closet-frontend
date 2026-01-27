"use client";

import { useMemo, useState, useEffect } from "react";
import { uploadImage, createItem, deleteItem, type Item } from "@/lib/api";
import { supabase } from "@/lib/supabase";

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

  const [filterCategory, setFilterCategory] = useState<string>("");
const [filterSeason, setFilterSeason] = useState<string>("");
const [filterColor, setFilterColor] = useState<string>("");

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
      console.log("DEBUG uploaded:", image_path);

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

  const filtered = items.filter((item) => {
  if (filterCategory && !item.categories.includes(filterCategory)) return false;
  if (filterSeason && !item.seasons.includes(filterSeason)) return false;
  if (filterColor && !item.colors.includes(filterColor)) return false;
  console.log(item);
  return true;
});

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authMsg, setAuthMsg] = useState("");


useEffect(() => {
  // 初回
  supabase.auth.getUser().then(({ data }) => {
    setUserEmail(data.user?.email ?? null);
  });

  // 変化監視
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    setUserEmail(session?.user?.email ?? null);
  });

  return () => sub.subscription.unsubscribe();
}, []);




useEffect(() => {
  (async () => {
    const { data } = await supabase.auth.getSession();
    setLog((prev) => prev + `\n\nsession: ${data.session?.user?.email ?? "none"}`);
  })();
}, []);

  const signUp = async () => {
    setAuthMsg("...");
    const { error } = await supabase.auth.signUp({ email, password });
    setAuthMsg(error ? error.message : "サインアップOK（そのままログインできるはず）");
  };

  const signIn = async () => {
    setAuthMsg("...");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthMsg(error ? error.message : "ログインOK");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAuthMsg("ログアウトしました");
  };


    if (!userEmail) {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-bold">Closet Login</h1>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">ログイン中：{userEmail}</div>
          <button
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
            onClick={signOut}
          >
            Logout
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex gap-2">
            <button className="rounded-lg border px-3 py-2" onClick={signUp}>
              新規登録
            </button>
            <button className="rounded-lg border px-3 py-2" onClick={signIn}>
              ログイン
            </button>
          </div>

          {authMsg && <p className="text-sm text-gray-600">{authMsg}</p>}
        </div>
      </main>
    );
  }

return (
  
  <main className="min-h-screen bg-gray-50">
    <div className="mx-auto max-w-3xl p-6 font-sans">
      <h1 className="text-2xl font-bold">Closet</h1>
      <p className="mt-1 text-sm text-gray-600">画像で服を管理するミニアプリ</p>

      {/* フィルタ */}
      <div className="mt-6 flex flex-wrap gap-3">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border bg-white px-3 py-2 text-sm"
        >
          <option value="">カテゴリ：全部</option>
          <option value="outer">outer</option>
          <option value="tops">tops</option>
          <option value="bottoms">bottoms</option>
        </select>

        <select
          value={filterSeason}
          onChange={(e) => setFilterSeason(e.target.value)}
          className="rounded-lg border bg-white px-3 py-2 text-sm"
        >
          <option value="">季節：全部</option>
          <option value="spring">spring</option>
          <option value="summer">summer</option>
          <option value="autumn">autumn</option>
          <option value="winter">winter</option>
        </select>

        <select
          value={filterColor}
          onChange={(e) => setFilterColor(e.target.value)}
          className="rounded-lg border bg-white px-3 py-2 text-sm"
        >
          <option value="">色：全部</option>
          <option value="black">black</option>
          <option value="white">white</option>
          <option value="navy">navy</option>
        </select>
      </div>

      {/* 入力フォーム */}
      <div className="mt-6 space-y-4 rounded-2xl border bg-white p-5 shadow-sm">
        <div>
          <label className="block text-sm font-semibold">名前</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="例：黒白コート"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold">サイズ</label>
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="例：M"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">素材</label>
            <input
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="例：wool"
            />
          </div>
        </div>

        <div className="space-y-3">
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
        </div>

        <div>
          <label className="block text-sm font-semibold">画像</label>
          <div className="mt-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-800"
            />
          </div>
        </div>

        <button
          onClick={onSubmit}
          className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          アップロード→登録
        </button>
      </div>

      {/* ログ */}
      <pre className="mt-4 overflow-auto rounded-xl bg-gray-100 p-3 text-xs">
        {log}
      </pre>

      {/* 作成結果 */}
      {created && (
        <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold">作成結果</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[240px_1fr]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {created?.image_path && (
              <img
                src={created.image_path}
                alt={created.name}
                className="h-60 w-full rounded-xl border object-cover"
              />
            )}

            <pre className="overflow-auto rounded-xl bg-gray-100 p-3 text-xs">
              {JSON.stringify(created, null, 2)}
            </pre>
          </div>
        </section>
      )}

      {/* 一覧 */}
      {filtered.length > 0 && (
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-bold">登録済みアイテム一覧</h2>
            <div className="text-xs text-gray-600">{filtered.length} 件</div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border bg-white p-3 shadow-sm transition hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {item.image_path && (
                  <img
                    src={item.image_path}
                    alt={item.name}
                    className="h-40 w-full rounded-xl object-cover"
                  />
                )}

                <div className="mt-2 font-semibold">{item.name}</div>
                <div className="mt-1 text-xs text-gray-600">
                  {item.categories.join(", ")}
                </div>
                <div className="text-xs text-gray-500">
                  {item.seasons.join(", ")}
                </div>

                <button
                  className="mt-3 w-full rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                  onClick={async () => {
                    await deleteItem(item.id);
                    setItems(await getItems());
                  }}
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  </main>
);

}
