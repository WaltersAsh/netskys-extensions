import {
    MangaTile,
    RequestManager,
    Tag,
    TagSection
} from 'paperback-extensions-common';

import entities = require('entities');

const BD_DOMAIN = 'https://buondua.com';

export function getAlbums ($: CheerioStatic): MangaTile[] {
    const albums: MangaTile[] = [];
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
                title: createIconText({text: entities.decodeHTML(title)})
            }));
        }
    }

    return albums;
}

export async function getGalleryData(id: string, requestManager: RequestManager, cheerio: CheerioAPI): Promise<any> {
    const request = createRequestObject({
        url: `${BD_DOMAIN}/${id}`,
        method: 'GET'
    });

    const data = await requestManager.schedule(request, 1);
    const $ = cheerio.load(data.data);
    
    const title = $('div.article-header').first().text();
    const image = $('img', 'div.article-fulltext').first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png';
    const dateInfo = $('small', 'div.article-info').last().text().split(' ');
    const timeSplit = dateInfo[0]?.split(':') ?? ['00', '00'];
    const dateSplit = dateInfo[1]?.split('-') ?? ['00', '00', '0000'];

    const tagHeader = $('div.article-tags').first();
    const tags = $('a.tag', tagHeader).toArray();
    const tagsToRender: Tag[] = [];
    for (const tag of tags) {
        const label = $('span', tag).text();
        const id = $(tag).attr('href');
        if (!id || !label) {
            continue;
        }
        tagsToRender.push({ id: encodeURIComponent(id), label: label });
    }

    const tagSections: TagSection[] = [createTagSection({
        id: '0',
        label: 'Tags',
        tags: tagsToRender.map(x => createTag(x)) 
    })];

    return {
        id: encodeURIComponent(id),
        titles: [title],
        image: image,
        tags: tagSections,
        date: new Date(parseInt(dateSplit[2] ?? '0000'), 
                       parseInt(dateSplit[1] ?? '00'), 
                       parseInt(dateSplit[0] ?? '00'),
                       parseInt(timeSplit[0] ?? '00'),
                       parseInt(timeSplit[1] ?? '00'))
    }
}

export async function getPages(id: string, requestManager: RequestManager, cheerio: CheerioAPI): Promise<string[]> {
    const request = createRequestObject({
        url: `${BD_DOMAIN}/${id}`,
        method: 'GET'
    });

    const data = await requestManager.schedule(request, 1);
    let $ = cheerio.load(data.data);
    
    const pages: string[] = [];
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

export const isLastPage = ($: CheerioStatic): boolean => {
    const nav = $('nav.pagination', 'div.is-full.main-container');
    const pageList = $('ul.pagination-list', nav);
    const lastPageNum = parseInt($('li', pageList).last().text());
    const currPageNum = parseInt($('a.is-current', pageList).text());
    console.log('Nav: ' + nav.text());
    console.log('Last page num: ' + lastPageNum);
    console.log('Current page num: ' + currPageNum);

    return (isNaN(lastPageNum) || 
            isNaN(currPageNum) ||
            lastPageNum === -1 || 
            lastPageNum === currPageNum ? 
            true : false);
}