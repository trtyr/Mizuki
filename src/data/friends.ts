// 在此添加你的友链
export interface FriendItem {
	id: number;
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;
	tags: string[];
}

export const friendsData: FriendItem[] = [];

export const getShuffledFriendsList = () => friendsData;
