import type { NavBarConfig } from "../types/config";
import { LinkPreset } from "../types/config";

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.Projects,
		LinkPreset.Skills,
		{
			name: "About",
			url: "/about",
			icon: "material-symbols:info",
		},
		{
			name: "GitHub",
			url: "https://github.com/trtyr",
			external: true,
			icon: "fa7-brands:github",
		},
	],
};
