"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLastPage = exports.parseSearch = exports.parseTags = exports.parseViewMore = exports.parseHomeSections = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const entities = require("entities");
const parseMangaDetails = ($, mangaId) => {
    const titles = [];
    titles.push(decodeHTMLEntity($('h4 > a').first()[0]?.firstChild.data?.trim() ?? ''));
    const image = $('img', 'div#cover').attr('src') ?? 'https://i.imgur.com/GYUxEX8.png';
    const artist = $('span:contains(Artist:)').next().text().trim();
    //Content Tags
    const arrayTags = [];
    for (const tag of $('a.tagbutton', $('span:contains(Content:)').parent()).toArray()) {
        const label = $(tag).text().trim();
        const id = $(tag).attr('href')?.split('/').pop()?.trim() ?? '';
        if (!id || !label || label == '-')
            continue;
        arrayTags.push({ id: id, label: label });
    }
    //Category Tags
    for (const tag of $('a.tagbutton', $('span:contains(Catergory:)').parent()).toArray()) {
        const label = $(tag).text().trim();
        const id = $(tag).attr('href')?.split('/').pop()?.trim() ?? '';
        if (!id || !label || label == '-')
            continue;
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    const description = decodeHTMLEntity($('span:contains(Brief Summary:)').parent().text().replace($('span:contains(Brief Summary:)').text(), '').trim());
    const rawStatus = $('span:contains(Status:)').next().text().trim();
    let status = paperback_extensions_common_1.MangaStatus.ONGOING;
    switch (rawStatus.toUpperCase()) {
        case 'ONGOING':
            status = paperback_extensions_common_1.MangaStatus.ONGOING;
            break;
        case 'COMPLETED':
            status = paperback_extensions_common_1.MangaStatus.COMPLETED;
            break;
        default:
            status = paperback_extensions_common_1.MangaStatus.ONGOING;
            break;
    }
    return createManga({
        id: mangaId,
        titles: titles,
        image: image,
        status: status,
        author: artist == '-' ? 'N/A' : artist,
        artist: artist == '-' ? 'N/A' : artist,
        tags: tagSections,
        desc: description,
    });
};
exports.parseMangaDetails = parseMangaDetails;
const parseChapters = ($, mangaId) => {
    const chapters = [];
    for (const chapter of $('li.sub-chp', 'ul.arf-list').toArray()) {
        const title = decodeHTMLEntity($('span.pull-left', chapter).text().replace($('span.pull-left i.text-muted', chapter).text(), '').trim());
        const chapterIdRaw = $('a', chapter).attr('href') ?? '';
        const chapterIdRegex = chapterIdRaw?.match(/m\/[A-z0-9]+\/(\d+)/);
        let chapterId = null;
        if (chapterIdRegex && chapterIdRegex[1])
            chapterId = chapterIdRegex[1];
        if (!chapterId)
            continue;
        const date = new Date();
        const chapterNumber = isNaN(Number(chapterId)) ? 0 : Number(chapterId);
        chapters.push(createChapter({
            id: chapterId,
            mangaId,
            name: title,
            langCode: paperback_extensions_common_1.LanguageCode.ENGLISH,
            chapNum: chapterNumber,
            time: date,
        }));
    }
    return chapters;
};
exports.parseChapters = parseChapters;
const parseChapterDetails = (data, mangaId, chapterId) => {
    const pages = [];
    let obj = /var rff_imageList = (.*);/.exec(data)?.[1] ?? ''; //Get the data else return null.
    if (obj == '')
        throw new Error('Unable to parse chapter details!'); //If null, throw error, else parse data to json.
    obj = JSON.parse(obj);
    for (const i of obj) {
        const page = 'https://hentaicdn.com/hentai' + i;
        pages.push(page);
    }
    const chapterDetails = createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
        longStrip: false
    });
    return chapterDetails;
};
exports.parseChapterDetails = parseChapterDetails;
const parseHomeSections = ($, sectionCallback) => {
    const staffSection = createHomeSection({ id: 'staff_pick', title: 'Staff Picks', view_more: true, type: paperback_extensions_common_1.HomeSectionType.singleRowLarge });
    const newestSection = createHomeSection({ id: 'newest', title: 'Recently Added', view_more: true });
    const trendingSection = createHomeSection({ id: 'trending', title: 'Trending', view_more: true });
    //Staff Pick
    const staffSection_Array = [];
    for (const manga of $('div.item', 'div#staffpick').toArray()) {
        const image = $('img', manga).attr('src') ?? '';
        const title = $('img', manga).attr('alt')?.trim() ?? '';
        const id = $('a', manga).attr('href')?.split('/').pop()?.trim();
        const subtitle = $('b.text-danger', manga).text().trim();
        if (!id || !title)
            continue;
        staffSection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle })
        }));
    }
    staffSection.items = staffSection_Array;
    sectionCallback(staffSection);
    //Recently Added
    const newestSection_Array = [];
    for (const manga of $($('div.row.row-sm')[1]).children('div').toArray()) {
        const image = $('img', manga).attr('src') ?? '';
        const title = $('img', manga).attr('alt')?.trim() ?? '';
        const id = $('a', manga).attr('href')?.split('/').pop()?.trim();
        const subtitle = $('span.label.label-danger', manga).text().trim();
        if (!id || !title)
            continue;
        newestSection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle })
        }));
    }
    newestSection.items = newestSection_Array;
    sectionCallback(newestSection);
    //Trending
    const trendingSection_Array = [];
    for (const manga of $($('ul.list-group')[1]).children('li.list-group-item').toArray()) {
        const image = $('img', manga).attr('src') ?? '';
        const title = $('img', manga).attr('alt')?.trim() ?? '';
        const id = $('a', manga).attr('href')?.split('/').pop()?.trim();
        if (!id || !title)
            continue;
        trendingSection_Array.push(createMangaTile({
            id: id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
        }));
    }
    trendingSection.items = trendingSection_Array;
    sectionCallback(trendingSection);
};
exports.parseHomeSections = parseHomeSections;
const parseViewMore = ($) => {
    const manga = [];
    const collectedIds = [];
    for (const obj of $('div.item', 'div.row.row-sm').toArray()) {
        const image = $('img', obj).attr('src') ?? '';
        const id = $('a', obj).attr('href')?.split('/').pop()?.trim();
        const title = $('img', obj).attr('alt')?.trim();
        const subtitle = $('b.text-danger', obj).text();
        if (!id || !title)
            continue;
        if (!collectedIds.includes(id)) {
            manga.push(createMangaTile({
                id,
                image: image,
                title: createIconText({ text: decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subtitle }),
            }));
            collectedIds.push(id);
        }
    }
    return manga;
};
exports.parseViewMore = parseViewMore;
const parseTags = ($) => {
    const arrayTags = [];
    for (const tag of $('div.list-group.item', 'div.col-xs-12').toArray()) {
        const label = $('span.clear > a', tag).text().trim();
        const id = $('span.clear > a', tag).attr('href')?.split('/').pop()?.trim() ?? '';
        if (!id || !label)
            continue;
        arrayTags.push({ id: id, label: label });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    return tagSections;
};
exports.parseTags = parseTags;
const parseSearch = ($) => {
    const mangas = [];
    for (const obj of $('div.item', 'div.row.row-sm').toArray()) {
        const id = $('a', obj).attr('href')?.split('/').pop()?.trim();
        const image = $('img', obj).attr('src') ?? '';
        const title = decodeHTMLEntity(String($('img', obj).attr('alt')?.trim()));
        const subtitle = $('b.text-danger', obj).text().trim();
        if (!id || !title)
            continue;
        mangas.push(createMangaTile({
            id,
            image: image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle }),
        }));
    }
    return mangas;
};
exports.parseSearch = parseSearch;
const decodeHTMLEntity = (str) => {
    return entities.decodeHTML(str);
};
const isLastPage = ($) => {
    let isLast = false;
    const pages = [];
    for (const page of $('li', 'ul.pagination').toArray()) {
        const p = Number($(page).text().trim());
        if (isNaN(p))
            continue;
        pages.push(p);
    }
    const lastPage = Math.max(...pages);
    const currentPage = Number($('li.active').text().trim());
    if (currentPage >= lastPage)
        isLast = true;
    return isLast;
};
exports.isLastPage = isLastPage;
