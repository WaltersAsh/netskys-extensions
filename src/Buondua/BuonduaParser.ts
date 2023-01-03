import {
    HomeSection,
    MangaTile,
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

    initialisedHomeSection.items = albums;
    sectionCallback(initialisedHomeSection);
}

export async function getGalleryData(id: string, requestManager: RequestManager, cheerio: CheerioAPI): Promise<any> {
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
            const id = $('a', albumCover).attr('href')?.replace(/\/$/, '')?.split('/').pop() ?? '';

            if (!id || !title) continue;
            albums.push(createMangaTile({
                id: encodeURIComponent(id),
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

function fixedEncodeURIComponent(str: string) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
  }
