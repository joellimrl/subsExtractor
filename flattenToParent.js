// Move all files from sub-folders to parent folder (will replace same files)
// Does not move from sub-sub-folders
import fs from "fs";
import "dotenv/config";
import { askQuestion, YES_ANSWERS } from "./prompt.js";

const moveFile = (oldPath, newPath) => {
	fs.renameSync(oldPath, newPath);
	console.log(`Successfully moved file: ${newPath}`);
};

const main = async () => {
	let fullPath = process.argv.slice(2).join(" ");
	if (!fs.existsSync(fullPath)) {
		console.error("Show not found, exiting");
		return;
	}
	console.log(`Show: ${fullPath}`);
    const ans = await askQuestion('Are you sure you would like to extract all files to parent directory? [YES/NO]\n');
    if (!YES_ANSWERS.includes(ans)) {
        console.log('Stopping process');
        return;
    }
	try {
		// get all folder directories
		const subFolderList = fs
			.readdirSync(fullPath)
			.filter((name) => fs.lstatSync(`${fullPath}/${name}`).isDirectory());

        if (subFolderList.length > 0) {
            console.log(`Folders found:\n`, subFolderList);
            subFolderList.forEach((subFolder) => {
                console.log(`Checking folder: ${subFolder}`);
                const subFolderPath = `${fullPath}/${subFolder}`;
                const subFolderSync = fs.readdirSync(subFolderPath);
                if (subFolderSync.length > 0) {
                    subFolderSync.forEach((subFolderFile) => {
                        moveFile(`${subFolderPath}/${subFolderFile}`, `${fullPath}/${subFolderFile}`);
                    })
                }
                fs.rmdir(`${subFolderPath}`, () => {
                    console.log(`Folder deleted: ${subFolderPath}`)
                });
            });
        } else {
            console.log('No folders found in directory')
        }
	} catch (e) {
		console.error(e.message);
		throw e;
	}
	console.log("Done!");
	return;
};

main();
