"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPages = exports.getGalleryData = exports.getAlbums = void 0;
const entities = require("entities");
const BD_DOMAIN = 'https://buondua.com';
function getAlbums($) {
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
                id: encodeURIComponent(id),
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: entities.decodeHTML(title) })
            }));
        }
    }
    return albums;
}
exports.getAlbums = getAlbums;
async function getGalleryData(id, requestManager, cheerio) {
    const request = createRequestObject({
        url: `${BD_DOMAIN}/${id}`,
        method: 'GET'
    });
    const data = await requestManager.schedule(request, 1);
    const $ = cheerio.load(data.data);
    // const tagsToRender: TagSection[] = [];
    const title = $('div.article-header').first().text();
    const image = $('img', 'div.article-fulltext').first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png';
    // const tags = $('div.tags', 'div.article-tags').toArray();
    // for (const tag of tags) {
    //     const tagId = $('a.tag', tag).attr('href') ?? '';
    //     console.log(tagId);
    //     const tagName = $('span', tag).text();
    //     console.log(tagName);
    //     tagsToRender.push(
    //         createTagSection({
    //             id: encodeURIComponent(tagId),
    //             label: tagName,
    //             tags: []
    //         }
    //     ));
    // }
    return {
        id: encodeURIComponent(id),
        titles: [title],
        image: image,
        tags: undefined
    };
}
exports.getGalleryData = getGalleryData;
async function getPages(id, requestManager, cheerio) {
    const request = createRequestObject({
        url: `${BD_DOMAIN}/${id}`,
        method: 'GET'
    });
    const data = await requestManager.schedule(request, 1);
    let $ = cheerio.load(data.data);
    const pages = [];
    const pageCount = parseInt($('a.pagination-link', 'nav.pagination').last().text());
    for (let i = 0; i < pageCount; i++) {
        const request = createRequestObject({
            url: `${BD_DOMAIN}/${id}?page=${i + 1}`,
            method: 'GET'
        });
        const data = await requestManager.schedule(request, 1);
        const $ = cheerio.load(data.data);
        const images = $('p', 'div.article-fulltext').toArray();
        for (const img of images) {
            const imageString = $('img', img).attr('src') ?? 'https://i.imgur.com/GYUxEX8.png';
            pages.push(imageString);
        }
    }
    return pages;
}
exports.getPages = getPages;
