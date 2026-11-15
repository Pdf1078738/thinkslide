import type { Accent, Theme } from "@/schema/presentation";

export const themeTokens: Record<Theme, {
  background: string;
  text: string;
  muted: string;
  panel: string;
}> = {
  paper: { background: "F7F4EE", text: "182420", muted: "68736C", panel: "FFFFFF" },
  midnight: { background: "151A22", text: "F5F7FA", muted: "AAB4C2", panel: "222B36" },
  ocean: { background: "EDF5F7", text: "12303A", muted: "55717A", panel: "FFFFFF" },
};

export const accentTokens: Record<Accent, string> = {
  coral: "E86A4A",
  blue: "4776E6",
  green: "2F8F72",
  gold: "C79436",
};

export const layoutLabels = {
  cover: "封面",
  agenda: "目录",
  bullets: "要点",
  twoColumn: "双栏",
  quote: "金句",
  closing: "结束页",
} as const;

export const themeLabels = {
  paper: "浅色纸张",
  midnight: "深色",
  ocean: "海洋蓝",
} as const;
