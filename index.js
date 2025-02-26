console.log('antiq.wiki js loaded.');

const qIndex = window.location.href.indexOf('?');
const queryString =
    qIndex === -1
        ? ""
        : decodeURIComponent(window.location.href.substring(qIndex + 1));
console.log(`queryString: [${queryString}]`);

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
        const parts = queryString.split("_");
        const result = await fetch("./data/content/" + parts[0] + ".txt");
        if (result.ok) {
            const textData = await result.text();
            const contentHtml = `<div><pre>${textData}</pre></div>`;
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

