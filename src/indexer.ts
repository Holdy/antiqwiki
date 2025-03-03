// processor.ts chops a source into indexable items (Stories etc)
// the indexer indexes them an links them together.

import * as fs from 'fs';
import * as path from 'path';

const PART_FILENAME_PATTERN = /^l\d+\.txt$/;


const numberFromFilename = (filename: String): number =>
    Number(filename.replace("l", "").replace(".txt", ""));

const writeDataObjectFile = (dataObject: any, fileName: string): void => {
    const lines :string[] = [];

    for (const key of Object.keys(dataObject).sort()) {
        lines.push(`${key}: ${dataObject[key]}`);
    }

    fs.writeFileSync(fileName, lines.join('\n'));
}

/**
 * Indexes the items in a directory (all part of one book)
 * The two main outputs are :
 *  1) An index file per item
 *  2) Linking if files together. (previous and next links)
 */
export function indexItemsIn(directory:string): void {
    // find the 'l' files
    const entries = fs.readdirSync(directory).filter(entry => entry.match(PART_FILENAME_PATTERN));

    entries.sort((a,b) => {
        if (a.match(PART_FILENAME_PATTERN) && b.match(PART_FILENAME_PATTERN)) {
            const aNum = Number(a.replace('l','').replace('.txt',''));    
            const bNum = Number(b.replace("l", "").replace(".txt", ""));    
            return aNum - bNum;
        }
        else {
            return (a < b) ? 1 : -1;
        }
    }); 

    const partFiles = entries.filter(entry => entry.match(PART_FILENAME_PATTERN));

    let previousItemNumber = 0;
    for (let index = 0; index < partFiles.length; index++) {
            const entry = partFiles[index];
        
            const fullFilePath = path.join(directory, entry);
            console.log("would index: " + fullFilePath);

            const nextFileNumber = (index + 1 < partFiles.length ) ? 
                numberFromFilename(partFiles[index+1]) : 0;
            const fileNumber = numberFromFilename(entry);
            const indexFileName = path.join(
                directory,
                `l${fileNumber}.index.txt`
            );

            const indexData = {
                previous: previousItemNumber,
                next: nextFileNumber,
            };

            writeDataObjectFile(indexData, indexFileName);
            previousItemNumber = fileNumber;
    }



}

indexItemsIn("/Users/Shared/projects/antiqwiki/data/content/s3");