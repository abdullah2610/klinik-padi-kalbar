import Icon from "./Icon";

type Tone = "default" | "pembeda" | "dampak" | "tip" | "identifikasi";

const TONE: Record<
  Tone,
  { wrap: string; iconWrap: string; label: string }
> = {
  default: {
    wrap: "bg-white border-black/10",
    iconWrap: "bg-black/5 text-ink/70",
    label: "text-ink/55",
  },
  pembeda: {
    wrap: "bg-penyakit-light border-penyakit/30",
    iconWrap: "bg-penyakit text-white",
    label: "text-penyakit",
  },
  dampak: {
    wrap: "bg-[#fbecea] border-alert/25",
    iconWrap: "bg-alert text-white",
    label: "text-alert",
  },
  tip: {
    wrap: "bg-padi-light border-padi/40",
    iconWrap: "bg-padi text-ink",
    label: "text-[#8a6d00]",
  },
  identifikasi: {
    wrap: "bg-hama-light border-hama/25",
    iconWrap: "bg-hama text-white",
    label: "text-hama",
  },
};

export default function InfoBlock({
  icon,
  label,
  children,
  tone = "default",
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
  tone?: Tone;
}) {
  const t = TONE[tone];
  return (
    <section className={`rounded-2xl border p-3.5 ${t.wrap}`}>
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${t.iconWrap}`}
        >
          <Icon name={icon} size={16} />
        </span>
        <h2
          className={`text-xs font-bold uppercase tracking-wide ${t.label}`}
        >
          {label}
        </h2>
      </div>
      <div className="text-[14px] leading-relaxed text-ink/85">{children}</div>
    </section>
  );
}
