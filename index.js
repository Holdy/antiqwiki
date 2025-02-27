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

const fillAndShow = (id, htmlContent) => {
    const element = document.getElementById(id);
    element.style.display = "block";
    element.innerHTML = htmlContent;
};

document.addEventListener("DOMContentLoaded", async () => {
    toggleDisplayed("main-left", false);
    toggleDisplayed("main-right", false);
    toggleDisplayed("main-top", false);
    toggleDisplayed("main-bottom", false);
    toggleDisplayed("main-header", false);
    toggleDisplayed("main-footer", false);
    toggleDisplayed("nav-row", false);

    if (queryString) {
        const contentIdMatch = queryString.match(/s\d+[\/-]l\d+/i);

        if (!contentIdMatch) {
            return;
        }
        contentId = contentIdMatch[0].toLowerCase().replace("-", "/");
        console.log("itemId : [" + contentId + "]");

        const result = await fetch("./data/content/" + contentId + ".txt");
        if (result.ok) {
            const textData = await result.text();
            const contentHtml = prepareText(textData);
            document.getElementById("main-body").innerHTML = contentHtml;
        }

        const sourceId = contentId.split("/")[0];
        const sourceMetaResult = await fetch(
            `./data/content/${sourceId}/${sourceId}.metadata.txt`
        );
        if (sourceMetaResult.ok) {
            const metadataMap = {};
            const lines = (await sourceMetaResult.text()).split("\n");
            for (const line of lines) {
                const colonIndex = line.indexOf(":");
                if (colonIndex !== -1) {
                    const parts = [
                        line.substring(0, colonIndex),
                        line.substring(colonIndex + 1),
                    ];
                    if (parts.length == 2) {
                        metadataMap[parts[0].trim()] = parts[1].trim();
                    }
                }
            }
            if (
                metadataMap.title &&
                metadataMap.author &&
                metadataMap.published
            ) {
                fillAndShow(
                    "main-header",
                    `From '${metadataMap.title}' by ${metadataMap.author} - published ${metadataMap.published}`
                );
            }
        }
    }

    // lets try a search.
    //   searchWord('caegat');
    //  searchWord('cat');
});

