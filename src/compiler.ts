import * as path from "path";
import * as fs from "fs";

const getCreateTime = (fileName): Promise<number> => {
  return new Promise((resolve, reject) => {
    fs.stat(fileName, (err, stats) => {
      if (err) {
        reject(err);
      }
      resolve(stats.birthtime.getTime());
    });
  });
};

/**
 * post-processes the metadata file from one 'story'
 * if it has .coorrdiates and .tags
 * Determins which file to put it in.
 */
export const postprocessStoryMetadata = async (
  slug: string,
  metadata: any
): Promise<void> => {
  if (metadata.coordinates && metadata.tags) {
    console.log("got : " + JSON.stringify(metadata, null, 3));

    const category =
      determineUntamedEarthCategory(metadata) ||
      "ERRORS-" + metadata.tags.replace(/ /g, "-");

    const fileName = path.join(
      __dirname,
      "compiler-output",
      `${category}.antiq.verified.csv`
    );
    if (fs.existsSync(fileName)) {
      const startTimeMs = Date.now() - process.uptime() * 1000;
      const createdTime = await getCreateTime(fileName);
      if (createdTime < startTimeMs) {
        console.log("Target file is from last run - restarting it");
        fs.rmSync(fileName);
        fs.appendFileSync(fileName, "latitude,longitude,label,link\n");
      }
    } else {
      fs.appendFileSync(fileName, "latitude,longitude,label,link\n");
    }

    // prepare the line
    const line = `${metadata.coordinates},${metadata.title},http://antiq.wiki/?${slug},${metadata.summary}\n`;
    fs.appendFileSync(fileName, line);
  }
};

const determineUntamedEarthCategory = (metadata: any): string | null => {
  if (metadata.tags === "fairy") {
    return "fairy";
  }

  console.error("Could not determine untamed.earth category");
  console.log("got : " + JSON.stringify(metadata, null, 3));
  return null;
};
