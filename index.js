console.log('antiq.wiki js loaded.');

const qIndex = window.location.href.indexOf('?');
const queryString =
    qIndex === -1
        ? ""
        : decodeURIComponent(window.location.href.substring(qIndex + 1));
console.log(`queryString: [${queryString}]`);

//#region text prep

const prepareText = (text) => {
    const preppedLines = [];
    for (let line of text.split('\n')){
        const testLine = line.trim();
        if (testLine && testLine[0]==='_' && testLine[testLine.length-1]==='_') {
            // looks line the whole line is a title
            line = `<h2>${line.replace(/_/g,' ').trim()}</h2>`
        }
        preppedLines.push(line);
    }

    return preppedLines.join('\n').replace(/\<\/h2\>\n/g,'</h2>').replace(/\n{2}/g, '<br/><br/>');
};

//#endregion text prep

const searchWord = async (word) => {
    if (!word || (!word.trim())) {
        return;
    }

    const result = await fetch(`./data/index/${word}.txt`);
    if (!result.ok) {
        return;
    }
    const lines = (await result.text()).toString().split('\n');
    for (let line of lines) {
        const commentIndex = line.indexOf('//');
        if (commentIndex !== -1) {
            line = line.substring(0, commentIndex).trim();
        }
        if (line) {
            // Blank lines / comment lines are ignored
            console.log(line);
        }
    }
}

const toggleDisplayed = (id, displayed) => {
    const element = document.getElementById(id);
    element.style.display = displayed ? 'block' : 'none';
}

document.addEventListener("DOMContentLoaded", async () => {
    if (queryString) {
        const contentIdMatch = queryString.match(/s\d+[\/-]l\d+/i);

        if (!contentIdMatch) {
            return;
        }
        contentId = contentIdMatch[0].toLowerCase();
        console.log("itemId : [" + contentId + "]");

        const result = await fetch("./data/content/" + contentId + ".txt");
        if (result.ok) {
            const textData = await result.text();
            const contentHtml = prepareText(textData);
            document.getElementById("main-body").innerHTML = contentHtml;
        }
    }

    toggleDisplayed("main-left", false);
    toggleDisplayed("main-right", false);
    toggleDisplayed("main-top", false);
    toggleDisplayed("main-bottom", false);
    toggleDisplayed("main-header", false);
    toggleDisplayed("main-footer", false);
    toggleDisplayed("nav-row", false);

    // lets try a search.
 //   searchWord('caegat');
  //  searchWord('cat');
});

