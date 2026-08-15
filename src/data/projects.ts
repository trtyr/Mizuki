// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	visitUrl?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	showImage?: boolean;
}

// 在此处添加你的项目
export const projectsData: Project[] = [
	{
		id: "learnsys",
		title: "learnsys · 学习系统",
		description:
			"本地优先的个人学习系统。目标→路径→模块→卡片→复习→掌握度→画像的闭环，SM-2 间隔重复。",
		image: "",
		category: "web",
		techStack: ["Rust", "Axum", "React", "TypeScript", "SQLite"],
		status: "in-progress",
		sourceCode: "https://github.com/trtyr/learnsys",
		startDate: "2026-08-14",
		featured: true,
		showImage: false,
	},
	{
		id: "project-manage",
		title: "project-manage · 项目跟踪管理",
		description:
			"把客户、项目、沟通、任务集中到一处。Rust/Axum + React/TS + PostgreSQL，编译期类型安全 SQL。",
		image: "",
		category: "web",
		techStack: ["Rust", "Axum", "React", "TypeScript", "PostgreSQL"],
		status: "in-progress",
		sourceCode: "https://github.com/trtyr/project-manage",
		startDate: "2026-07-16",
		featured: true,
		showImage: false,
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
