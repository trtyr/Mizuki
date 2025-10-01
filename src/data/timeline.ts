// Timeline data configuration file
// Used to manage data for the timeline page

export interface TimelineItem {
	id: string;
	title: string;
	description: string;
	type: "work" | "certificate" | "personal" | "learning" | "project";
	startDate: string;
	endDate?: string; // If empty, it means current
	location?: string;
	organization?: string;
	position?: string;
	skills?: string[];
	achievements?: string[];
	links?: {
		name: string;
		url: string;
		type: "website" | "certificate" | "project" | "other";
	}[];
	icon?: string; // Iconify icon name
	color?: string;
	featured?: boolean;
}

export const timelineData: TimelineItem[] = [
	// 当前状态 - 只有当前正在进行的项目（没有endDate）
	{
		id: "current-internship",
		title: "上海某主机安全厂商实习",
		description: "目前在主机安全厂商实习，参与安全服务相关工作",
		type: "work",
		startDate: "2025-07-01",
		location: "上海",
		position: "安全服务工程师",
		skills: ["主机安全", "安全服务", "应急响应"],
		icon: "material-symbols:work",
		color: "#DC2626",
		featured: true,
	},

	// 历史记录 - 工作经历（有明确的endDate）
	{
		id: "beijing-threat-intelligence-internship",
		title: "北京某威胁情报安全厂商实习",
		description:
			"在北京威胁情报安全厂商实习，参与安全巡检、渗透测试、驻场支持和攻防演练等工作",
		type: "work",
		startDate: "2025-03-10",
		endDate: "2025-06-01",
		location: "北京",
		position: "安全服务工程师",
		skills: ["安全巡检", "渗透测试", "应急响应", "攻防演练"],
		achievements: [
			"完成14次安全巡检任务",
			"执行13天渗透测试，发现多处漏洞",
			"参与新奥能源、国家电网攻防演练",
			"成功处置XRed、银狐等恶意木马",
		],
		icon: "material-symbols:work",
		color: "#DC2626",
	},

	// 历史记录 - 证书（有明确的获得日期，不是持续性的）
	{
		id: "cisp-pte-certificate",
		title: "CISP-PTE认证",
		description: "获得国家注册信息安全专业人员-渗透测试工程师认证",
		type: "certificate",
		startDate: "2024-10-26",
		endDate: "2024-10-26", // 证书获得是特定日期，不是持续状态
		organization: "中国信息安全测评中心",
		links: [
			{
				name: "CISP-PTE认证",
				url: "https://www.itsec.gov.cn/",
				type: "certificate",
			},
		],
		icon: "material-symbols:verified",
		color: "#059669",
	},
	{
		id: "computer-level-3-certificate",
		title: "全国计算机等级考试",
		description: "通过全国计算机等级考试三级-信息安全技术考试",
		type: "certificate",
		startDate: "2023-03",
		endDate: "2023-03", // 考试通过是特定日期
		organization: "教育部考试中心",
		links: [
			{
				name: "计算机等级证书",
				url: "https://www.neea.edu.cn/",
				type: "certificate",
			},
		],
		icon: "material-symbols:verified",
		color: "#059669",
	},
	{
		id: "vocational-skill-certificate",
		title: "全国职业技能等级证书",
		description: "获得网络与信息安全管理员高级职业技能等级证书",
		type: "certificate",
		startDate: "2024-12-04",
		endDate: "2024-12-04", // 证书获得是特定日期
		organization: "人力资源和社会保障部",
		links: [
			{
				name: "职业技能证书",
				url: "http://www.osta.org.cn/",
				type: "certificate",
			},
		],
		icon: "material-symbols:verified",
		color: "#059669",
	},

	// 历史记录 - 个人经历（比赛和活动都有明确的日期）
	{
		id: "liaoning-vocational-competition",
		title: "辽宁省第二届职业技能大赛",
		description: "参加辽宁省第二届职业技能大赛网络安全赛项，获得银牌成绩",
		type: "personal",
		startDate: "2024-10-25",
		endDate: "2024-10-25", // 比赛是特定日期
		location: "辽宁",
		organization: "辽宁省人力资源和社会保障厅",
		achievements: ["网络安全赛项银牌", "提升实战技能水平"],
		icon: "material-symbols:emoji-events",
		color: "#7C3AED",
		featured: true,
	},
	{
		id: "datasea-challenge",
		title: '"中软国际--卓越杯"大数据挑战赛',
		description: "参加大数据挑战赛，获得二等奖",
		type: "personal",
		startDate: "2022-10-08",
		endDate: "2022-10-08", // 比赛是特定日期
		organization: "中软国际",
		achievements: ["大数据挑战赛二等奖", "锻炼数据分析能力"],
		icon: "material-symbols:emoji-events",
		color: "#7C3AED",
	},
	{
		id: "city-level-network-defense",
		title: "地市级护网行动",
		description: "参与地市级护网行动，担任攻击队员，表现优秀",
		type: "personal",
		startDate: "2024-09",
		endDate: "2024-09", // 护网行动是特定月份
		achievements: ["优秀攻击队员", "实战攻防经验"],
		icon: "material-symbols:security",
		color: "#EA580C",
	},

	// 历史记录 - 学习经历（除了大学学习，其他都有明确的结束时间）
	{
		id: "university-study",
		title: "上大学啦！",
		description: "进入辽宁工程技术大学网络工程专业学习，开启大学生活",
		type: "learning",
		startDate: "2022-09",
		endDate: "2026-07", // 大学有明确的毕业时间
		location: "辽宁",
		organization: "辽宁工程技术大学",
		position: "网络工程专业",
		skills: ["网络工程", "计算机基础"],
		achievements: ["获得科技奖学金", "系统学习专业知识"],
		icon: "material-symbols:school",
		color: "#2563EB",
		featured: true,
	},
	{
		id: "first-website-build",
		title: "第一次搭建网站",
		description: "初次尝试搭建个人网站，学习Web开发基础知识",
		type: "learning",
		startDate: "2023-10",
		endDate: "2023-10", // 学习完成是特定月份
		skills: ["HTML", "CSS", "JavaScript", "Web开发"],
		achievements: ["完成第一个网站项目", "掌握Web开发基础"],
		icon: "material-symbols:code",
		color: "#7C3AED",
	},
	{
		id: "network-security-learning",
		title: "学习网络安全",
		description: "开始系统学习网络安全知识，进入网络安全领域",
		type: "learning",
		startDate: "2024-07",
		endDate: "2024-07", // 学习开始是特定月份
		skills: ["网络安全", "渗透测试", "漏洞挖掘"],
		achievements: ["建立网络安全知识体系", "开始实战练习"],
		icon: "material-symbols:security",
		color: "#EA580C",
	},
	{
		id: "first-ai-exposure",
		title: "第一次了解AI",
		description: "开始接触和学习人工智能相关知识，了解AI技术发展",
		type: "learning",
		startDate: "2025-03",
		endDate: "2025-03", // 学习开始是特定月份
		skills: ["人工智能", "机器学习"],
		achievements: ["建立AI基础知识", "了解AI应用场景"],
		icon: "material-symbols:psychology",
		color: "#7C3AED",
	},
	{
		id: "first-ai-jailbreak",
		title: "第一次对AI产品jailbreak",
		description:
			"成功对多个AI模型进行越狱测试，包括Claude 3.5/3.7、微步XGTP、DeepSeek、ChatGPT等",
		type: "learning",
		startDate: "2025-03-17",
		endDate: "2025-03-17", // 特定日期的成就
		skills: ["AI安全", "提示词工程", "越狱技术"],
		achievements: ["掌握AI越狱技术", "成功实践多个AI模型"],
		icon: "material-symbols:psychology",
		color: "#7C3AED",
	},
];

// Get timeline statistics
export const getTimelineStats = () => {
	const total = timelineData.length;
	const byType = {
		work: timelineData.filter((item) => item.type === "work").length,
		certificate: timelineData.filter((item) => item.type === "certificate")
			.length,
		personal: timelineData.filter((item) => item.type === "personal").length,
		learning: timelineData.filter((item) => item.type === "learning").length,
		project: timelineData.filter((item) => item.type === "project").length, // 添加项目类型统计
	};

	return { total, byType };
};

// Get timeline items by type
export const getTimelineByType = (type?: string) => {
	if (!type || type === "all") {
		return timelineData.sort(
			(a, b) =>
				new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
		);
	}
	return timelineData
		.filter((item) => item.type === type)
		.sort(
			(a, b) =>
				new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
		);
};

// Get featured timeline items
export const getFeaturedTimeline = () => {
	return timelineData
		.filter((item) => item.featured)
		.sort(
			(a, b) =>
				new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
		);
};

// Get current ongoing items (only items without endDate)
export const getCurrentItems = () => {
	return timelineData.filter((item) => !item.endDate);
};

// Get historical items (only items with endDate)
export const getHistoricalItems = () => {
	return timelineData.filter((item) => item.endDate);
};

// Calculate total work experience
export const getTotalWorkExperience = () => {
	const workItems = timelineData.filter((item) => item.type === "work");
	let totalMonths = 0;

	workItems.forEach((item) => {
		const startDate = new Date(item.startDate);
		const endDate = item.endDate ? new Date(item.endDate) : new Date();
		const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
		const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
		totalMonths += diffMonths;
	});

	const years = Math.floor(totalMonths / 12);
	const months = totalMonths % 12;

	// 如果工作经验少于1年，显示月份；否则显示年份
	if (years === 0) {
		return {
			years: 0,
			months: months,
			display: `${months}个月`,
		};
	}
	return {
		years: years,
		months: months,
		display: `${years}年${months > 0 ? `${months}个月` : ""}`,
	};
};
