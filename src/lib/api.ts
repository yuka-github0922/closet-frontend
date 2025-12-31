const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export type Item = {
  id: number;
  name: string;
  categories: string[];
  colors: string[];
  seasons: string[];
  size?: string;
  material?: string;
  image_path: string;
};

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await res.text());

  const data = (await res.json()) as { image_path: string };
  return data.image_path;
}

export async function createItem(body: Omit<Item, "id">) {
  const res = await fetch(`${API_BASE}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as Item;
}

export async function getItems(): Promise<Item[]> {
  const res = await fetch(`${API_BASE}/items`);
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as Item[];
}

export function imageUrl(path: string) {
  // path は "/uploads/xxx.png" みたいなのが来る想定
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function deleteItem(id: number) {
  const res = await fetch(`${API_BASE}/items/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}