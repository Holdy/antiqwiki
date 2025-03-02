import * as fs from 'fs';
import * as path from 'path';

function looksLikeTitle (text:string): boolean {
    if (text.match(/^ *[\p{L} \-'’\.:]+ *$/u) && text === text.toUpperCase()) {
        if (text.match(/^ *[XILV]+. *$/)) {
            return false;
        }

        return true; // all caps capital
    }

    if (text.match(/^ +_[\p{L}0-9 \-'’\.;:]+_ ?$/u)) {
        // centered and emphases
        return true;
    }

    if (text.indexOf(`Transcriber's Notes:`) !== -1) {
        return true;
    }

    return false;
}

function looksLikeBlockEnd(text: string): boolean {
    if (text.match(/^[ \*]+$/)) {
        // asterisc separator
        return true;
    }
    if (text.match(/^FOOTNOTES: {0,}$/)) {
        return true;
    }
    return false;
}

function writeBlockFile(
    directoryName,
    lines: string[],
    blockLineStart: number
): void {
    fs.writeFileSync(
        path.join(directoryName, `l${blockLineStart}.txt`),
        lines.join("\n")
    );
}

function processFile(fileName: string) {
    console.log(`Reading file ${fileName}`);

    const directorySep = fileName.lastIndexOf("/");
    if (!directorySep) {
        console.error("Could not find directory separator in file path");
    }
    const outputDirectory = fileName.substr(0, directorySep);

    const lines = fs.readFileSync(fileName).toString().split("\n");

    let blockStartLine = 0;
    const blockLines: string[] = [];
    let currentLine = 0;
    for (const line of lines) {
        console.log(line);
        currentLine++;

        if (line.startsWith("!~")) {
            break; // out of loop - no more lines.
        }

        if (line.startsWith("~")) {
            console.log("title!");
            if (blockStartLine != 0) {
                writeBlockFile(outputDirectory, blockLines, blockStartLine);
                blockStartLine = 0;
                blockLines.length = 0;
            }
            blockStartLine = currentLine;
            blockLines.push(line.substring(1));
        } else {
            // its a line of the current block (if we're in one)
            if (blockStartLine) {
                blockLines.push(line);
            }
        }
    }
    if (blockStartLine != 0) {
        writeBlockFile(outputDirectory, blockLines, blockStartLine);
    }

    console.log("would output to: " + outputDirectory);
}


const fileName = process.argv[2];
processFile(fileName)