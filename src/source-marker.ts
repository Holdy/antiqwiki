import * as fs from 'fs';
import * as path from 'path';

function looksLikeTitle (text:string): boolean {
    if (text.match(/^ *[\p{L} \-'’\.,]+ *$/u) && text === text.toUpperCase()) {

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

function looksLikeContentTrailer(line :string): boolean {
    if (line.indexOf("END OF THE PROJECT GUTENBERG EBOOK") !== -1) {
        return true;
    }
        return line.indexOf("THE FULL PROJECT GUTENBERG LICENSE") !== -1;
}

function looksLikeBlockEnd(text:string): boolean {
    if (text.match(/^[ \*]+$/)) {
        // asterisc separator
        return true;
    }
    if (text.match(/^FOOTNOTES: {0,}$/)){
        return true;
    } 
    return false;
}


function processFile(fileName:string) {
    console.log(`Reading file ${fileName}`);

    const directorySep = fileName.lastIndexOf('/');
    if (!directorySep) {
        console.error('Could not find directory separator in file path');
    }

    const lines = fs.readFileSync(fileName).toString().split('\n');

    let markNextLineAsStart = true;
    let seenContentTrailer = false;
    let blockStartLine = 0;
    let currentLine = 0;

    let rewrittenLines:string[]  = [];

    for (const rawLine of lines) {
        // remove any previous mark
        let line = rawLine.replace(/^\!?~/, '');
        console.log(line);
        currentLine++;

        if (looksLikeContentTrailer(line) || seenContentTrailer) {
            line = '!~' + line;
            seenContentTrailer=true;
      
        }
        else {
        

            if (markNextLineAsStart) {
                markNextLineAsStart=false;
                line = '~' +line;
            } else if (looksLikeBlockEnd(line)) {
                markNextLineAsStart = true;
            } 
            else if (looksLikeTitle(line)) {
                line = '~' + line;
            } 
        }
        rewrittenLines.push(line);
    }

    fs.writeFileSync(fileName, rewrittenLines.join('\n'));

}


const fileName = process.argv[2];
processFile(fileName)
