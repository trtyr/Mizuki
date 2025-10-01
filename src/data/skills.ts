// Skill data configuration file
// Used to manage data for the skill display page
export interface Skill {
	id: string;
	name: string;
	description: string;
	icon: string; // Iconify icon name
	category: "工具使用" | "编程技能" | "安全技能" | "数据库";
	level: "beginner" | "intermediate" | "advanced" | "expert";
	experience: {
		years: number;
		months: number;
	};
	projects?: string[]; // Related project IDs
	certifications?: string[];
	color?: string; // Skill card theme color
}

export const skillsData: Skill[] = [
	// 工具使用
	{
		id: "vscode",
		name: "VScode",
		description:
			"A lightweight but powerful code editor with a rich plugin ecosystem.",
		icon: "vscode-icons:file-type-vscode",
		category: "工具使用",
		level: "advanced",
		experience: { years: 3, months: 0 },
		color: "#007ACC",
	},
	{
		id: "rustrover",
		name: "RustRover",
		description: "A cross-platform IDE by JetBrains for Rust development.",
		icon: "devicon:jetbrains",
		category: "工具使用",
		level: "beginner",
		experience: { years: 0, months: 1 },
		color: "#000000",
	},
	{
		id: "pycharm",
		name: "Pycharm",
		description:
			"A professional Python IDE by JetBrains providing intelligent code analysis and debugging features.",
		icon: "devicon:pycharm",
		category: "工具使用",
		level: "intermediate",
		experience: { years: 2, months: 0 },
		color: "#21D789",
	},
	{
		id: "git",
		name: "Git",
		description:
			"A distributed version control system, an essential tool for code management and team collaboration.",
		icon: "mdi:git",
		category: "工具使用",
		level: "intermediate",
		experience: { years: 2, months: 0 },
		color: "#F05032",
	},
	{
		id: "linux",
		name: "Linux",
		description:
			"An open-source operating system, the preferred choice for server deployment and development environments.",
		icon: "simple-icons:linux",
		category: "工具使用",
		level: "intermediate",
		experience: { years: 2, months: 0 },
		color: "#FCC624",
	},
	{
		id: "docker",
		name: "Docker",
		description:
			"A containerization platform that simplifies application deployment and environment management.",
		icon: "mdi:docker",
		category: "工具使用",
		level: "beginner",
		experience: { years: 1, months: 0 },
		color: "#2496ED",
	},
	{
		id: "wireshark",
		name: "WireShark",
		description:
			"A network protocol analyzer for capturing and interacting with traffic running on a computer network.",
		icon: "simple-icons:wireshark",
		category: "工具使用",
		level: "intermediate",
		experience: { years: 1, months: 0 },
		color: "#00A693",
	},
	{
		id: "cobaltstrike",
		name: "Cobalt Strike",
		description:
			"A commercial advanced post-exploitation command and control platform.",
		icon: "mdi:target-account",
		category: "工具使用",
		level: "intermediate",
		experience: { years: 1, months: 0 },
		color: "#FF6C37",
	},
	{
		id: "cmd",
		name: "CMD",
		description:
			"Windows Command Prompt, a command-line interpreter application.",
		icon: "mdi:console",
		category: "工具使用",
		level: "intermediate",
		experience: { years: 3, months: 0 },
		color: "#00BCF2",
	},
	{
		id: "powershell",
		name: "PowerShell",
		description:
			"A task automation and configuration management framework from Microsoft.",
		icon: "mdi:powershell",
		category: "工具使用",
		level: "beginner",
		experience: { years: 0, months: 4 },
		color: "#00BCF2",
	},
	{
		id: "shell",
		name: "Shell",
		description:
			"A command-line interpreter for Unix-like operating systems.",
		icon: "mdi:bash",
		category: "工具使用",
		level: "beginner",
		experience: { years: 1, months: 0 },
		color: "#4EAA25",
	},

	// 编程技能
	{
		id: "javascript",
		name: "JavaScript",
		description:
			"Modern JavaScript development, including ES6+ syntax, asynchronous programming, and modular development.",
		icon: "vscode-icons:file-type-js",
		category: "编程技能",
		level: "beginner",
		experience: { years: 0, months: 0 },
		color: "#F7DF1E",
	},
	{
		id: "rust",
		name: "Rust",
		description:
			"A systems programming language focusing on safety, speed, and concurrency, with no garbage collector.",
		icon: "simple-icons:rust",
		category: "编程技能",
		level: "beginner",
		experience: { years: 0, months: 1 },
		color: "#CE422B",
	},
	{
		id: "python",
		name: "Python",
		description:
			"A general-purpose programming language suitable for web development, data analysis, machine learning, and more.",
		icon: "vscode-icons:file-type-python",
		category: "编程技能",
		level: "intermediate",
		experience: { years: 1, months: 0 },
		color: "#3776AB",
	},
	{
		id: "java",
		name: "Java",
		description:
			"A mainstream programming language for enterprise application development, cross-platform and object-oriented.",
		icon: "vscode-icons:file-type-java",
		category: "编程技能",
		level: "beginner",
		experience: { years: 0, months: 3 },
		color: "#ED8B00",
	},
	{
		id: "c",
		name: "C",
		description:
			"A low-level systems programming language, the foundation for operating systems and embedded systems development.",
		icon: "vscode-icons:file-type-c",
		category: "编程技能",
		level: "beginner",
		experience: { years: 0, months: 3 },
		color: "#A8B9CC",
	},
	{
		id: "vibecoding",
		name: "Vibe Coding",
		description: "A modern coding platform and workflow.",
		icon: "material-symbols:code",
		category: "编程技能",
		level: "intermediate",
		experience: { years: 0, months: 6 },
		color: "#007ACC",
	},

	// 安全技能
	{
		id: "websecurity",
		name: "Web 安全",
		description:
			"Techniques and practices for securing web applications and services.",
		icon: "material-symbols:security",
		category: "安全技能",
		level: "intermediate",
		experience: { years: 1, months: 0 },
		color: "#FF6C37",
	},
	{
		id: "webtrafficanalysis",
		name: "Web 流量分析",
		description:
			"Analysis of web traffic patterns for security and performance insights.",
		icon: "material-symbols:analytics",
		category: "安全技能",
		level: "intermediate",
		experience: { years: 1, months: 0 },
		color: "#00A693",
	},
	{
		id: "burpsuite",
		name: "BurpSuite",
		description:
			"A comprehensive penetration testing tool for web application security.",
		icon: "simple-icons:burpsuite",
		category: "安全技能",
		level: "intermediate",
		experience: { years: 1, months: 0 },
		color: "#FF6C37",
	},
	{
		id: "internalnetworktrafficanalysis",
		name: "内网流量分析",
		description:
			"Analysis of internal network traffic for security monitoring and threat detection.",
		icon: "material-symbols:lan",
		category: "安全技能",
		level: "intermediate",
		experience: { years: 1, months: 0 },
		color: "#00A693",
	},
	{
		id: "internalnetworksecurity",
		name: "内网安全",
		description:
			"Security practices and measures for protecting internal network infrastructure.",
		icon: "material-symbols:shield-lock",
		category: "安全技能",
		level: "intermediate",
		experience: { years: 1, months: 0 },
		color: "#FF6C37",
	},
	{
		id: "windowsincidentresponse",
		name: "Windows 应急响应",
		description:
			"Procedures and tools for responding to security incidents on Windows systems.",
		icon: "material-symbols:emergency",
		category: "安全技能",
		level: "intermediate",
		experience: { years: 1, months: 0 },
		color: "#00BCF2",
	},
	{
		id: "linuxincidentresponse",
		name: "Linux 应急响应",
		description:
			"Procedures and tools for responding to security incidents on Linux systems.",
		icon: "material-symbols:emergency",
		category: "安全技能",
		level: "beginner",
		experience: { years: 0, months: 5 },
		color: "#FCC624",
	},

	// 数据库
	{
		id: "mysql",
		name: "MySQL",
		description:
			"The world's most popular open-source relational database management system, widely used in web applications.",
		icon: "vscode-icons:file-type-mysql",
		category: "数据库",
		level: "beginner",
		experience: { years: 0, months: 3 },
		color: "#4479A1",
	},
	{
		id: "sqlserver",
		name: "SQL Server",
		description:
			"A relational database management system developed by Microsoft.",
		icon: "mdi:database",
		category: "数据库",
		level: "beginner",
		experience: { years: 0, months: 3 },
		color: "#CC2927",
	},
];

// Get skill statistics
export const getSkillStats = () => {
	const total = skillsData.length;
	const byLevel = {
		beginner: skillsData.filter((s) => s.level === "beginner").length,
		intermediate: skillsData.filter((s) => s.level === "intermediate").length,
		advanced: skillsData.filter((s) => s.level === "advanced").length,
		expert: skillsData.filter((s) => s.level === "expert").length,
	};
	const byCategory = {
		"工具使用": skillsData.filter((s) => s.category === "工具使用").length,
		"编程技能": skillsData.filter((s) => s.category === "编程技能").length,
		"安全技能": skillsData.filter((s) => s.category === "安全技能").length,
		"数据库": skillsData.filter((s) => s.category === "数据库").length,
	};

	return { total, byLevel, byCategory };
};

// Get skills by category
export const getSkillsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return skillsData;
	}
	return skillsData.filter((s) => s.category === category);
};

// Get advanced skills
export const getAdvancedSkills = () => {
	return skillsData.filter(
		(s) => s.level === "advanced" || s.level === "expert",
	);
};

// Calculate total years of experience
export const getTotalExperience = () => {
	const totalMonths = skillsData.reduce((total, skill) => {
		return total + skill.experience.years * 12 + skill.experience.months;
	}, 0);
	return {
		years: Math.floor(totalMonths / 12),
		months: totalMonths % 12,
	};
};
