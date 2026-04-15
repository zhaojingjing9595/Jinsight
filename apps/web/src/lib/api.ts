import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function getToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function trpcQuery<T = unknown>(
  path: string,
  input?: Record<string, unknown>,
): Promise<T> {
  const token = await getToken();
  const url = new URL(`${API_URL}/trpc/${path}`);
  if (input && Object.keys(input).length > 0) {
    url.searchParams.set("input", JSON.stringify(input));
  }

  const res = await fetch(url.toString(), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error: ${res.status}${text ? `\n${text}` : ""}`);
  }
  const body = await res.json();
  return body.result?.data;
}

export async function trpcMutate<T = unknown>(
  path: string,
  input?: Record<string, unknown>,
): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${API_URL}/trpc/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input ?? {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error: ${res.status}${text ? `\n${text}` : ""}`);
  }
  const body = await res.json();
  return body.result?.data;
}
