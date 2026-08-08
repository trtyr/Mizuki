// Skill data configuration file
// Used to manage data for the skill display page

export interface Skill {
	id: string;
	name: string;
	description: string;
	icon: string; // Iconify icon name
	category: "frontend" | "backend" | "database" | "tools" | "other" | "渗透测试" | "应急响应" | "AI";
	level: "beginner" | "intermediate" | "advanced" | "expert";
	experience: {
		years: number;
		months: number;
	};
	projects?: string[]; // Related project IDs
	certifications?: string[];
	color?: string; // Skill card theme color
}

// 在此处添加你的技能
// 图标可在 https://icon-sets.iconify.design/ 搜索
export const skillsData: Skill[] = [
	// 渗透测试
	{
		id: "web-pentest",
		name: "Web 渗透测试",
		description: "Web 应用安全评估，漏洞挖掘与利用",
		icon: "material-symbols:language",
		category: "渗透测试",
		level: "expert",
		experience: { years: 3, months: 0 },
		color: "#ef4444",
	},
	{
		id: "intranet-pentest",
		name: "内网横向移动",
		description: "域渗透，内网侦察与横向移动，权限提升",
		icon: "material-symbols:lan",
		category: "渗透测试",
		level: "advanced",
		experience: { years: 2, months: 0 },
		color: "#dc2626",
	},
	{
		id: "pi-agent",
		name: "Pi Agent",
		description: "Pi Coding Agent 应用与 Skill 开发",
		icon: "material-symbols:terminal",
		category: "AI",
		level: "expert",
		experience: { years: 1, months: 0 },
		color: "#d946ef",
	},
	// 应急响应
	{
		id: "incident-triage",
		name: "入侵排查",
		description: "安全事件现场勘验，入侵路径还原",
		icon: "material-symbols:search",
		category: "应急响应",
		level: "expert",
		experience: { years: 3, months: 0 },
		color: "#3b82f6",
	},
	{
		id: "log-analysis",
		name: "日志分析",
		description: "海量日志中提取攻击链路与 IOC",
		icon: "material-symbols:list",
		category: "应急响应",
		level: "advanced",
		experience: { years: 2, months: 6 },
		color: "#2563eb",
	},
	{
		id: "threat-hunting",
		name: "威胁狩猎",
		description: "主动发现网络中的隐藏威胁",
		icon: "material-symbols:trackpad-input",
		category: "应急响应",
		level: "advanced",
		experience: { years: 2, months: 0 },
		color: "#4f46e5",
	},
	// AI
	{
		id: "llm-agent",
		name: "AI Agent",
		description: "LLM Agent 架构设计与应用",
		icon: "material-symbols:robot",
		category: "AI",
		level: "advanced",
		experience: { years: 1, months: 0 },
		color: "#8b5cf6",
	},
	{
		id: "prompt-engineering",
		name: "Prompt Engineering",
		description: "提示工程与自动化工作流设计",
		icon: "material-symbols:edit-note",
		category: "AI",
		level: "expert",
		experience: { years: 1, months: 6 },
		color: "#a855f7",
	},
	{
		id: "ai-automation",
		name: "AI 自动化",
		description: "用 AI 替代重复劳动，构建智能管线",
		icon: "material-symbols:smart-toy",
		category: "AI",
		level: "advanced",
		experience: { years: 1, months: 0 },
		color: "#c084fc",
	},
];

// Get skill statistics
export const getSkillStats = () => {
	const total = skillsData.length;
	const byLevel: Record<string, number> = {};
	skillsData.forEach((s) => {
		byLevel[s.level] = (byLevel[s.level] || 0) + 1;
	});
	return { total, byLevel };
};

// Get skills by category
export const getSkillsByCategory = (category?: string) => {
	if (!category || category === "all") return skillsData;
	return skillsData.filter((s) => s.category === category);
};
