// 在此添加你的番剧（需启用在 siteConfig 中开启 featurePages.anime）
export interface AnimeItem {
	title: string;
	cover: string;
	link: string;
	year: number;
	progress: number;
	totalEpisodes: number;
	rating: number;
	status: string;
	studio: string;
	genre: string[];
	description: string;
}

const localAnimeList: AnimeItem[] = [];

export default localAnimeList;
