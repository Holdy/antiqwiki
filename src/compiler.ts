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

const decapitalise = (text: string): string => {
  const originalWords = text.trim().split(" ");

  return originalWords
    .map((word) => {
      if (word.toUpperCase() === word) {
        const newWord = word[0].toUpperCase() + word.substring(1).toLowerCase();
        return newWord;
      }
      return word;
    })
    .join(" ");
};

const startTimeMs = Date.now() - process.uptime() * 1000;

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
    console.log("target file: " + fileName);
    if (fs.existsSync(fileName)) {
      console.log("exists");
      const createdTime = await getCreateTime(fileName);
      if (createdTime < startTimeMs) {
        console.log(
          "Target file is from last run - restarting it " +
            `created ${createdTime}} processStart: ${startTimeMs}`
        );
        fs.rmSync(fileName);
        fs.appendFileSync(fileName, "latitude,longitude,label,link\n");
      }
    } else {
      fs.appendFileSync(fileName, "latitude,longitude,label,link\n");
    }

    // prepare the line
    const line = `${metadata.coordinates},${decapitalise(
      metadata.title
    )},http://antiq.wiki/?${slug},${metadata.summary}\n`;
    fs.appendFileSync(fileName, line);
  }
};

/**
 * Synonym sets is an array of :
 * 'preferred word' 'alternate 1' 'alternate 2' (as per the file)
 * It is used to map alternatives to the the preferred word
 */
const synononymSets = fs
  .readFileSync(path.join(__dirname, "../data/synonyms.txt"))
  .toString()
  .split("\n")
  .filter((line) => !!line.trim())
  .map((nonEmptyLine) => nonEmptyLine.split(" "));

const knownUECategory: string[] = [
  "fairy",
  "folklore",
  "troll",
  "merfolk",
  "devil",
  "sunken-settlement",
  "haunting",
  "grave",
];

const determineUntamedEarthCategory = (metadata: any): string | null => {
  const articleTags = (metadata.tags ?? "").split(" ");

  // See if theres already a known tag
  for (const articleTag of articleTags) {
    if (knownUECategory.includes(articleTag)) {
      return articleTag; // eg 'fairy'
    }

    for (const synonymSet of synononymSets) {
      if (
        synonymSet.includes(articleTag) &&
        knownUECategory.includes(synonymSet[0])
      ) {
        return synonymSet[0];
      }
    }
  }

  console.error("Could not determine untamed.earth category");
  console.log("got : " + JSON.stringify(metadata, null, 3));
  return null;
};
