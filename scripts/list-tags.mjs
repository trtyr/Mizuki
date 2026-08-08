import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const postsDir = resolve(import.meta.dirname || ".", "../src/content/posts");

const categories = new Set();
const tags = new Set();

function walk(dir) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = resolve(dir, entry.name);
		if (entry.isDirectory()) { walk(full); continue; }
		if (!entry.name.endsWith(".md")) continue;

		const text = readFileSync(full, "utf-8");
		const fm = text.match(/^---\n([\s\S]*?)\n---/);
		if (!fm) continue;

		let inCats = false, inTags = false;
		for (const line of fm[1].split("\n")) {
			if (line.startsWith("categories:") || line.startsWith("category:")) {
				inCats = true; inTags = false;
				const singleCat = line.match(/^categor(?:y|ies):\s*["']?([^"'\n]+?)["']?\s*$/);
				if (singleCat && singleCat[1]) categories.add(singleCat[1].trim());
				continue;
			}
			if (line.startsWith("tags:")) { inTags = true; inCats = false; continue; }
			const m = line.match(/^\s*-\s+(.+)$/);
			if (!m) { inCats = false; inTags = false; continue; }
			if (inCats) categories.add(m[1].trim());
			if (inTags) tags.add(m[1].trim());
		}
	}
}

walk(postsDir);

console.log("📂 分类 (Categories):");
for (const c of [...categories].sort()) console.log(`  - ${c}`);
console.log(`\n🏷️  标签 (Tags):`);
for (const t of [...tags].sort()) console.log(`  - ${t}`);
