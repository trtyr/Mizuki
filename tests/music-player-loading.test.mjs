import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const storeSource = await readFile(
	new URL("../src/stores/musicPlayerStore.ts", import.meta.url),
	"utf8",
);
const constantsSource = await readFile(
	new URL(
		"../src/components/widgets/music-player/constants.ts",
		import.meta.url,
	),
	"utf8",
);

function methodSource(name, nextName) {
	const start = storeSource.indexOf(`\tprivate ${name}`);
	const end = storeSource.indexOf(`\tprivate ${nextName}`, start + 1);
	assert.notEqual(start, -1, `${name} should exist`);
	assert.notEqual(end, -1, `${nextName} should exist after ${name}`);
	return storeSource.slice(start, end);
}

describe("Music player media loading boundary", () => {
	it("keeps initialization metadata-only and disables media preload", () => {
		assert.match(storeSource, /this\.audio\.preload = "none"/);
		assert.match(
			storeSource,
			/this\.selectSong\(this\.state\.playlist\[0\], false\)/,
		);

		const selectSong = methodSource("selectSong", "releaseAudioSource");
		assert.doesNotMatch(selectSong, /\.src\s*=/);
		assert.doesNotMatch(selectSong, /\.load\(\)/);
	});

	it("assigns the real source only through an explicit media-loading path", () => {
		const ensureAudioSource = methodSource(
			"ensureAudioSource",
			"requestPlayback",
		);
		assert.match(ensureAudioSource, /this\.audio\.src = sourceUrl/);
		assert.match(ensureAudioSource, /this\.audio\.load\(\)/);
		assert.match(storeSource, /this\.ensureAudioSource\(\)/);
	});

	it("bounds automatic retries to one playlist traversal", () => {
		assert.match(storeSource, /this\.playbackErrorCount \+= 1/);
		assert.match(storeSource, /this\.playbackErrorCount < maxAttempts/);
		assert.match(storeSource, /this\.state\.willAutoPlay = false/);
	});

	it("ships non-zero duration metadata for every local song", () => {
		const durations = [...constantsSource.matchAll(/duration:\s*(\d+)/g)].map(
			(match) => Number(match[1]),
		);
		assert.equal(durations.length, 5);
		assert.ok(durations.slice(0, 4).every((duration) => duration > 0));
	});
});
