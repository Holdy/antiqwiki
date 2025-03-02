console.log('antiq.wiki js loaded.');

const qIndex = window.location.href.indexOf('?');
const queryString =
    qIndex === -1
        ? ""
        : decodeURIComponent(window.location.href.substring(qIndex + 1));
console.log(`queryString: [${queryString}]`);

const contentIdMatch = queryString.match(/s\d+[\/-]l\d+/i);
const contentId = contentIdMatch
    ? contentIdMatch[0].toLowerCase().replace("-", "/")
    : null;

const itemData = {};

//#region text prep

const prepareText = (text) => {
    const preppedLines = [];
    for (let line of text.split("\n")) {
        const testLine = line.trim();
        if (
            testLine &&
            testLine[0] === "_" &&
            testLine[testLine.length - 1] === "_"
        ) {
            // looks line the whole line is a title
            line = `<h2>${line.replace(/_/g, " ").trim()}</h2>`;
        }
        preppedLines.push(line);
    }

    return preppedLines
        .map((line) => (line.trim() === "" ? "&nbsp;" : line))
        .join("\n")
        .replace(/\[\d+\]/g, "") // footnote ref.
        .replace(/\<\/h2\>\n/g, "</h2>")
        .replace(/\n/g, "<br/>");
};

//#endregion text prep

const searchWord = async (word) => {
    if (!word || !word.trim()) {
        return;
    }

    const result = await fetch(`./data/index/${word}.txt`);
    if (!result.ok) {
        return;
    }
    const lines = (await result.text()).toString().split("\n");
    for (let line of lines) {
        const commentIndex = line.indexOf("//");
        if (commentIndex !== -1) {
            line = line.substring(0, commentIndex).trim();
        }
        if (line) {
            // Blank lines / comment lines are ignored
            console.log(line);
        }
    }
};

const toggleDisplayed = (id, displayed) => {
    const element = document.getElementById(id);
    element.style.display = displayed ? "block" : "none";
};

const fillAndShow = (id, htmlContent) => {
    const element = document.getElementById(id);
    element.style.display = "block";
    element.innerHTML = htmlContent;
};

const go = (direction) => {
    const to = itemData[direction];
    if (to && to != "0") {
        const url = `.?${contentId.substring(0, 2)}-l${to}.txt`;
        window.location.href = url;
    }
};

const parseDataObject = (text, itemData) => {
    for (const line of text.split("\n")) {
        const i = line.indexOf(":");
        if (i !== -1) {
            itemData[line.substring(0, i)] = line.substring(i + 1).trim();
        }
    }
};

const nonZero = (text) => text && text != "0";
const nobr = (text) => text.replace(" ", "&nbsp;");

document.addEventListener("DOMContentLoaded", async () => {
    toggleDisplayed("main-left", false);
    toggleDisplayed("main-right", false);
    toggleDisplayed("main-top", false);
    toggleDisplayed("main-bottom", false);
    toggleDisplayed("nav-row", false);

    if (queryString) {
        if (!contentId) {
            return;
        }
        console.log("itemId : [" + contentId + "]");

        const itemResult = await fetch(
            "./data/content/" + contentId + ".index.txt"
        );
        if (itemResult.ok) {
            const text = await itemResult.text();
            parseDataObject(text, itemData);
            console.log("ItemData:" + JSON.stringify(itemData));
        }
        toggleDisplayed("main-header-end", nonZero(itemData["previous"]));
        toggleDisplayed("main-footer-end", nonZero(itemData["next"]));

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
                    "main-header-content",
                    `From '${nobr(metadataMap.title)}' by ${nobr(
                        metadataMap.author
                    )} - published ${metadataMap.published}`
                );
            }
        }
    }

    // lets try a search.
    //   searchWord('caegat');
    //  searchWord('cat');
});

