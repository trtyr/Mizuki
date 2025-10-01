// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other" | "automation";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
}

export const projectsData: Project[] = [
	// {
	// 	id: "mizuki-blog",
	// 	title: "Mizuki Blog Theme",
	// 	description:
	// 		"Modern blog theme developed based on the Astro framework, supporting multilingual, dark mode, and responsive design features.",
	// 	image: "",
	// 	category: "web",
	// 	techStack: ["Astro", "TypeScript", "Tailwind CSS", "Svelte"],
	// 	status: "completed",
	// 	liveDemo: "https://blog.example.com",
	// 	sourceCode: "https://github.com/example/mizuki",
	// 	startDate: "2024-01-01",
	// 	endDate: "2024-06-01",
	// 	featured: true,
	// 	tags: ["Blog", "Theme", "Open Source"],
	// },
	// {
	// 	id: "portfolio-website",
	// 	title: "Personal Portfolio",
	// 	description:
	// 		"Personal portfolio website showcasing project experience and technical skills.",
	// 	image: "",
	// 	category: "web",
	// 	techStack: ["React", "Next.js", "TypeScript", "Framer Motion"],
	// 	status: "completed",
	// 	liveDemo: "https://portfolio.example.com",
	// 	sourceCode: "https://github.com/example/portfolio",
	// 	startDate: "2023-09-01",
	// 	endDate: "2023-12-01",
	// 	featured: true,
	// 	tags: ["Portfolio", "React", "Animation"],
	// },
	// {
	// 	id: "task-manager-app",
	// 	title: "Task Manager App",
	// 	description:
	// 		"Cross-platform task management application supporting team collaboration and project management.",
	// 	image: "",
	// 	category: "mobile",
	// 	techStack: ["React Native", "TypeScript", "Redux", "Firebase"],
	// 	status: "in-progress",
	// 	startDate: "2024-03-01",
	// 	tags: ["Mobile", "Productivity", "Team Collaboration"],
	// },
	// {
	// 	id: "data-visualization-tool",
	// 	title: "Data Visualization Tool",
	// 	description:
	// 		"Data visualization tool supporting multiple chart types and interactive analysis.",
	// 	image: "",
	// 	category: "web",
	// 	techStack: ["Vue.js", "D3.js", "TypeScript", "Node.js"],
	// 	status: "completed",
	// 	liveDemo: "https://dataviz.example.com",
	// 	startDate: "2023-06-01",
	// 	endDate: "2023-11-01",
	// 	tags: ["Data Visualization", "Analytics", "Charts"],
	// },
	// {
	// 	id: "e-commerce-platform",
	// 	title: "E-commerce Platform",
	// 	description:
	// 		"Full-stack e-commerce platform including user management, product management, and order processing features.",
	// 	image: "",
	// 	category: "web",
	// 	techStack: ["Next.js", "Node.js", "PostgreSQL", "Stripe"],
	// 	status: "planned",
	// 	startDate: "2024-07-01",
	// 	tags: ["E-commerce", "Full Stack", "Payment Integration"],
	// },
	{
		id: "mcp-gateway",
		title: "MCP Gateway",
		description: "基于Python的MCP网关，提供模型上下文协议的网关服务。",
		image: "",
		category: "other",
		techStack: ["Python"],
		status: "completed",
		sourceCode: "https://github.com/trtyr/MCP-Gateway",
		startDate: "2025-04-25",
		featured: true,
		tags: ["MCP", "Gateway", "Python", "Open Source"],
	},
	{
		id: "spectrascope-term",
		title: "SpectraScope Term",
		description:
			"Give AI freedom to control, create terminals, and be able to observe AI behavior in Linux",
		image: "",
		category: "other",
		techStack: ["Python"],
		status: "completed",
		sourceCode: "https://github.com/trtyr/SpectraScope-Term",
		startDate: "2025-05-11",
		tags: ["AI", "Terminal", "Linux", "Python", "Open Source"],
	},
	{
		id: "google-search-subdomain-extractor",
		title: "Google Search Subdomain Extractor",
		description: "被动爬取通过Google Search得到的子域名",
		image: "",
		category: "other",
		techStack: ["JavaScript"],
		status: "completed",
		sourceCode: "https://github.com/trtyr/Google_Search_Subdomain_Extractor",
		startDate: "2025-04-06",
		tags: [
			"Subdomain",
			"Google Search",
			"JavaScript",
			"Security",
			"Open Source",
		],
	},
	{
		id: "telegram-autocheckin",
		title: "Telegram AutoCheckIn",
		description: "Telegram简易自动签到",
		image: "",
		category: "other",
		techStack: ["Python"],
		status: "completed",
		sourceCode: "https://github.com/trtyr/Telegram_AutoCheckIn",
		startDate: "2024-12-01",
		tags: ["Telegram", "Automation", "Python", "Open Source"],
	},
	{
		id: "umami-automation-deploy",
		title: "Umami 自动化部署脚本",
		description:
			"简化 Umami 网站分析工具的部署过程，提供一键自动化部署解决方案",
		image: "",
		category: "automation",
		techStack: ["Shell", "Bash"],
		status: "completed",
		sourceCode: "https://discord.gg/wcPKT6Z7",
		startDate: "2025-10-01",
		tags: ["Umami", "Automation", "Deployment", "Web Analytics", "Open Source"],
	},
	{
		id: "twikoo-automation-deploy",
		title: "Twikoo 自动化部署脚本",
		description:
			"简化 Twikoo 评论系统的部署过程，为静态网站提供一键自动化部署解决方案",
		image: "",
		category: "automation",
		techStack: ["Shell", "Bash"],
		status: "completed",
		sourceCode: "https://discord.gg/wcPKT6Z7",
		startDate: "2025-10-01",
		tags: ["Twikoo", "Automation", "Deployment", "Comment System", "Open Source"],
	},
];

// Get project statistics
export const getProjectStats = () => {
	const total = projectsData.length;
	const completed = projectsData.filter((p) => p.status === "completed").length;
	const inProgress = projectsData.filter(
		(p) => p.status === "in-progress",
	).length;
	const planned = projectsData.filter((p) => p.status === "planned").length;

	return {
		total,
		byStatus: {
			completed,
			inProgress,
			planned,
		},
	};
};

// Get projects by category
export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

// Get featured projects
export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

// Get all tech stacks
export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => {
			techSet.add(tech);
		});
	});
	return Array.from(techSet).sort();
};
