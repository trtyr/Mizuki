// 在此添加你的日记
export interface DiaryItem {
	id: number;
	content: string;
	date: string;
	images?: string[];
	location?: string;
	mood?: string;
	tags?: string[];
}

const diaryData: DiaryItem[] = [];

export const getDiaryList = (limit?: number) => {
	const sortedData = [...diaryData].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);
	return limit && limit > 0 ? sortedData.slice(0, limit) : sortedData;
};

export const getAllTags = () => {
	const tags = new Set<string>();
	diaryData.forEach((d) => d.tags?.forEach((t) => tags.add(t)));
	return Array.from(tags);
};
