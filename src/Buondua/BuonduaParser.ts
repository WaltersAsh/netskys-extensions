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

export const parseHomeSections = ($: CheerioStatic, sectionCallback: (section: HomeSection) => void, initialisedHomeSection: HomeSection): void => {
    const hotAlbums: MangaTile[] = [];

    const albumCoverGroups = $('div.blog').toArray();
    console.log(albumCoverGroups);

    for (const albumCoverGroup of albumCoverGroups) {
        const albumCovers = $('div.items-row', albumCoverGroup).toArray();

        for (const albumCover of albumCovers) {
            const image = $('img', albumCover).first().attr('src') ?? '';
            const title = $('img', albumCover).first().attr('alt') ?? '';
            const id = $('a', albumCover).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? '';

            if (!id || !title) continue
            hotAlbums.push(createMangaTile({
                id: id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({text: entities.decodeHTML(title)})
            }));
        }
    }

    initialisedHomeSection.items = hotAlbums;
    sectionCallback(initialisedHomeSection);
}

export async function parseGalleryData(id: string, requestManager: RequestManager, cheerio: CheerioStatic): Promise<any> {
}

export async function getPages(id: string, requestManager: RequestManager, cheerio: CheerioStatic): Promise<string[]> {
    throw new Error("Not Implemented");
}

export async function getSearchData(query: string | undefined, page: number, requestManager: RequestManager, cheerio: CheerioStatic): Promise<[MangaTile[], boolean]> {
    throw new Error("Not Implemented");
}