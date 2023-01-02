"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSearchData = exports.getPages = exports.parseGalleryData = exports.parseViewMore = exports.getGalleryData = exports.parseHomeSections = void 0;
const entities = require("entities");
const BD_DOMAIN = 'https://buondua.com';
const parseHomeSections = ($, sectionCallback, initialisedHomeSection) => {
    const albums = [];
    const albumCoverGroups = $('div.blog').toArray();
    for (const albumCoverGroup of albumCoverGroups) {
        const albumCovers = $('div.items-row', albumCoverGroup).toArray();
        for (const albumCover of albumCovers) {
            const image = $('img', albumCover).first().attr('src') ?? '';
            const title = $('img', albumCover).first().attr('alt') ?? '';
            const id = $('a', albumCover).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? '';
            if (!id || !title) {
                continue;
            }
            albums.push(createMangaTile({
                id: encodeURI(id),
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: entities.decodeHTML(title) })
            }));
        }
    }
    initialisedHomeSection.items = albums;
    sectionCallback(initialisedHomeSection);
};
exports.parseHomeSections = parseHomeSections;
async function getGalleryData(id, requestManager, cheerio) {
    const request = createRequestObject({
        url: `${BD_DOMAIN}/${id}`,
        method: 'GET'
    });
    console.log(request.url);
    const data = await requestManager.schedule(request, 1);
    const $ = cheerio.load(data.data);
    const titles = [];
    titles.push($('div.article-header').first().text());
    const image = $('img', 'div.article-fulltext').first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png';
    return {
        id: encodeURI(id),
        titles: titles,
        image: image
    };
}
exports.getGalleryData = getGalleryData;
const parseViewMore = ($) => {
    const albums = [];
    const collectedIds = [];
    const albumCoverGroups = $('div.blog').toArray();
    for (const albumCoverGroup of albumCoverGroups) {
        const albumCovers = $('div.items-row', albumCoverGroup).toArray();
        for (const albumCover of albumCovers) {
            const image = $('img', albumCover).first().attr('src') ?? '';
            const title = $('img', albumCover).first().attr('alt') ?? '';
            const id = $('a', albumCover).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? '';
            if (!id || !title)
                continue;
            albums.push(createMangaTile({
                id: encodeURI(id),
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: entities.decodeHTML(title) })
            }));
            collectedIds.push(id);
        }
    }
    return albums;
};
exports.parseViewMore = parseViewMore;
async function parseGalleryData(id, requestManager, cheerio) {
}
exports.parseGalleryData = parseGalleryData;
async function getPages(id, requestManager, cheerio) {
    throw new Error("Not Implemented");
}
exports.getPages = getPages;
async function getSearchData(query, page, requestManager, cheerio) {
    throw new Error("Not Implemented");
}
exports.getSearchData = getSearchData;
