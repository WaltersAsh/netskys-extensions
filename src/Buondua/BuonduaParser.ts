import {
    Chapter,
    ChapterDetails,
    Tag,
    HomeSection,
    LanguageCode,
    Manga,
    MangaStatus,
    MangaTile,
    TagSection,
    HomeSectionType,
    RequestManager
} from 'paperback-extensions-common';

import entities = require('entities');

const BD_DOMAIN = 'https://buondua.com';

export const parseHomeSections = ($: CheerioStatic, sectionCallback: (section: HomeSection) => void, initialisedHomeSection: HomeSection): void => {
    const albums: MangaTile[] = [];
    const albumCoverGroups = $('div.blog').toArray();

    for (const albumCoverGroup of albumCoverGroups) {
        const albumCovers = $('div.items-row', albumCoverGroup).toArray();

        for (const albumCover of albumCovers) {
            const image = $('img', albumCover).first().attr('src') ?? '';
            const title = $('img', albumCover).first().attr('alt') ?? '';
            const id = $('a', albumCover).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? '';

            if (!id || !title) continue;
            albums.push(createMangaTile({
                id: id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({text: entities.decodeHTML(title)})
            }));
        }
    }

    initialisedHomeSection.items = albums;
    sectionCallback(initialisedHomeSection);
}

export async function getGalleryData(id: string, requestManager: RequestManager, cheerio: CheerioAPI): Promise<any> {

    const request = createRequestObject({
        url: `${BD_DOMAIN}/${id}`,
        method: 'GET'
    });

    console.log('this is before request manager is called');
    const data = await requestManager.schedule(request, 1); // Fails here
    console.log('this is before cheerio is called');
    const $ = cheerio.load(data.data);

    console.log('this is after cheerio is called');

    const titles: string[] = [];
    titles.push($('h1.article-header').first().text());
    const image = $('img', 'div.article-fulltext').first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png';

    return {
        id: id,
        titles: titles,
        image: image
    }
}

export const parseViewMore = ($: CheerioStatic): MangaTile[] => {
    const albums: MangaTile[] = [];
    const collectedIds: string[] = [];
    const albumCoverGroups = $('div.blog').toArray();

    for (const albumCoverGroup of albumCoverGroups) {
        const albumCovers = $('div.items-row', albumCoverGroup).toArray();

        for (const albumCover of albumCovers) {
            const image = $('img', albumCover).first().attr('src') ?? '';
            const title = $('img', albumCover).first().attr('alt') ?? '';
            console.log(title);
            const id = $('a', albumCover).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? '';

            if (!id || !title) continue;
            albums.push(createMangaTile({
                id: id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({text: entities.decodeHTML(title)})
            }));
            collectedIds.push(id);
        }
    }

    return albums;
}

export async function parseGalleryData(id: string, requestManager: RequestManager, cheerio: CheerioStatic): Promise<any> {
}

export async function getPages(id: string, requestManager: RequestManager, cheerio: CheerioStatic): Promise<string[]> {
    throw new Error("Not Implemented");
}

export async function getSearchData(query: string | undefined, page: number, requestManager: RequestManager, cheerio: CheerioStatic): Promise<[MangaTile[], boolean]> {
    throw new Error("Not Implemented");
}