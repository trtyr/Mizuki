// 在此添加你的 AI 工具
export type AIToolCategory = "chat" | "coding" | "image" | "audio" | "video" | "writing" | "search" | "other";
export type AIToolFrequency = "daily" | "weekly" | "occasional" | "experimental";
export type LocaleString = Partial<Record<"en" | "zh_CN" | "zh_TW" | "ja", string>>;

export function getLocaleString(value: LocaleString, lang: string): string {
	return value[lang as keyof LocaleString] ?? value["en"] ?? "";
}

export interface AITool {
	id: string;
	name: string | LocaleString;
	description: string | LocaleString;
	category: AIToolCategory;
	frequency: AIToolFrequency;
	url: string;
	icon: string;
	tags: string[];
}

export const aiToolsData: AITool[] = [];
