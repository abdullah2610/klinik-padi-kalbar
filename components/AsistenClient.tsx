"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

const CONTOH = [
  "Beda blas dan bercak coklat apa?",
  "Kenapa daun padi menggulung saat kemarau?",
  "Cara kendalikan wereng batang coklat?",
  "Tanah masam, harus bagaimana?",
];

export default function AsistenClient({
  fokusSlug,
  fokusNama,
}: {
  fokusSlug?: string;
  fokusNama?: string;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const contoh = fokusNama ? [`Jelaskan ${fokusNama}`, ...CONTOH] : CONTOH;

  async function tanya(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    setError(null);
    setInput("");

    const history = msgs.slice(-6);
    setMsgs((m) => [...m, { role: "user", text: question }, { role: "assistant", text: "" }]);
    setBusy(true);

    try {
      const res = await fetch("/api/asisten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, fokus: fokusSlug, history }),
      });

      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Gagal menghubungi asisten.");
        setMsgs((m) => m.slice(0, -1)); // buang placeholder
        return;
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = { role: "assistant", text: acc };
          return copy;
        });
      }
    } catch {
      setError("Tidak dapat terhubung. Periksa koneksi.");
      setMsgs((m) => m.slice(0, -1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-140px)] flex-col px-4 py-5">
      <h1 className="text-xl font-extrabold">Asisten</h1>
      <p className="mt-1 text-sm text-ink/65">
        Tanya-jawab dari isi buku saku. Jawaban menautkan entri sumber.
        {fokusNama && (
          <>
            {" "}
            Fokus: <span className="font-semibold text-penyakit">{fokusNama}</span>.
          </>
        )}
      </p>

      {/* Percakapan */}
      <div className="mt-4 flex-1">
        {msgs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 bg-white/50 p-5 text-center">
            <Icon name="chat" size={32} className="mx-auto mb-2 text-penyakit/60" />
            <p className="text-sm text-ink/60">
              Mulai dengan salah satu contoh, atau ketik pertanyaan Anda.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {msgs.map((m, i) => (
              <li
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-hama text-white"
                      : "border border-black/10 bg-white text-ink/85"
                  }`}
                >
                  {m.text || (
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:0.3s]" />
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-alert/25 bg-alert/5 px-3 py-2 text-sm text-alert">
          {error}
        </p>
      )}

      {/* Contoh pertanyaan */}
      {msgs.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {contoh.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => tanya(c)}
              className="rounded-full border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-ink/70 hover:border-black/30"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          tanya(input);
        }}
        className="sticky bottom-20 mt-3 flex items-end gap-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              tanya(input);
            }
          }}
          rows={1}
          placeholder="Tulis pertanyaan…"
          className="max-h-32 min-h-[48px] flex-1 resize-none rounded-2xl border border-black/15 bg-white px-3.5 py-3 text-[15px] outline-none focus:border-penyakit"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Kirim"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-penyakit text-white disabled:opacity-40"
        >
          <Icon name="arrow-right" size={22} />
        </button>
      </form>

      <p className="mt-2 text-center text-[11px] text-ink/45">
        Jawaban dibatasi isi buku saku. Konfirmasi lewat ciri pembeda; pestisida
        gunakan produk terdaftar sesuai label.
      </p>
    </div>
  );
}
