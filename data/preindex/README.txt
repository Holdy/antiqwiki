/data/preindex

A single file for each search-term.

The first phase of an indexing pass will consist of:
    Reading each item and converting it to terms.
    Writing the score for the document in each terms preindex file.

The second phase of indexing is to sort each single preinex file
and write out an ordered chain of index chunks.