import fs from "fs";
import { basename, extname } from "path";
import "dotenv/config";

const getFileName = (name) => {
	return basename(name, extname(name));
};

const moveFile = (oldPath, newPath) => {
	fs.renameSync(oldPath, newPath);
	console.log(`Successfully moved subtitle file: ${newPath}`);
};

const main = () => {
	const mainPathToShows = `${process.env.SHOW_PATH}` || "C:/Shows";
    const splitBySeason = process.argv[2];
	if (splitBySeason !== 'yes' && splitBySeason !== 'no') {
		console.error("Please enter if show is split by season folders\nFormat is 'node index.js [split by season: yes/no] [folder name]'");
		return;
	}
	const showName = process.argv.slice(3).join(" ");
	if (showName.length < 1) {
		console.error("Please enter show name\nFormat is 'node index.js [split by season: yes/no] [folder name]'");
		return;
	}
	let fullPath = `${mainPathToShows}/${showName}`;
	if (!fs.existsSync(fullPath)) {
		console.error("Show not found, exiting\nFormat is 'node index.js [split by season: yes/no] [folder name]'");
		return;
	}
	if (splitBySeason === 'no') { // reset fullpath if not split
		fullPath = mainPathToShows;
	}
	console.log(`Show: ${fullPath}`);
	try {
		let seasonsList = [];
		if (splitBySeason === 'yes') {
			// get all folder directories (should be split by seasons)
			seasonsList = fs
				.readdirSync(fullPath)
				.filter((name) => fs.lstatSync(`${fullPath}/${name}`).isDirectory());
		} else {
			seasonsList = [showName];
		}
		console.log(`Folders found:\n`, seasonsList);

		// get list of episodes names (if have subtitle file with same name, skip)
		seasonsList.forEach((season) => {
			console.log(`Checking folder: ${season}`);
			const seasonPath = `${fullPath}/${season}`;
			const seasonDirSync = fs.readdirSync(seasonPath);
			const subListFilter = seasonDirSync
				.filter((name) => [".stl", ".srt"].includes(extname(name)))
				.map((name) => getFileName(name));
			const episodeList = seasonDirSync
				.filter(
					(name) =>
						[".mp4", ".mkv"].includes(extname(name)) &&
						!subListFilter.some((sl) => sl.includes(getFileName(name)))
				)
				.map((name) => getFileName(name));
			// skip folder if no episodes found
			if (episodeList.length === 0) {
				console.log("No videos without subs found, moving on");
				return;
			}
			const dirList = seasonDirSync.filter((name) =>
				fs.lstatSync(`${seasonPath}/${name}`).isDirectory()
			);
			// search for subtitles in all sub folders
			dirList.forEach((dir) => {
				const subDirectory = `${seasonPath}/${dir}`;
				const subtitlesMain = fs
					.readdirSync(subDirectory)
					.filter((name) => [".stl", ".srt"].includes(extname(name)))
					.map((name) => getFileName(name));
				// search for folder/subs containing episode name
				episodeList.forEach((episode) => {
					const episodePath = `${subDirectory}/${episode}`;
					// if srt file, rename and move accordingly (must be exact name)
					if (subtitlesMain.includes(episode)) {
						moveFile(`${episodePath}.srt`, `${seasonPath}/${episode}.srt`);
					}
					// if folder, extract only english subs and rename accordingly
					if (fs.existsSync(episodePath)) {
						const subtitlesFolder = fs.readdirSync(episodePath);
						subtitlesFolder.forEach((subs) => {
							if (subs.toLowerCase().includes("english"))
								moveFile(
									`${episodePath}/${subs}`,
									`${seasonPath}/${episode}${subs}`
								);
						});
					}
				});
			});
		});
	} catch (e) {
		console.error(e.message);
		throw e;
	}
	console.log("Done!");
	return;
};

main();
