"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Buondua = exports.BuonduaInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const BuonduaParser_1 = require("./BuonduaParser");
const BD_DOMAIN = 'https://buondua.com';
exports.BuonduaInfo = {
    version: '1.0.1',
    name: 'Buondua',
    icon: 'icon.png',
    author: 'WaltersAsh',
    authorWebsite: 'https://github.com/WaltersAsh',
    description: 'Extension to grab albums from Buon Dua',
    contentRating: paperback_extensions_common_1.ContentRating.ADULT,
    websiteBaseURL: BD_DOMAIN,
    sourceTags: [
        {
            text: '18+',
            type: paperback_extensions_common_1.TagType.RED
        }
    ]
};
class Buondua extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.requestManager = createRequestManager({
            requestsPerSecond: 4,
            requestTimeout: 15000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        ...{
                            'referer': BD_DOMAIN
                        }
                    };
                    return request;
                },
                interceptResponse: async (response) => {
                    return response;
                }
            }
        });
    }
    getMangaShareUrl(mangaId) {
        return `${BD_DOMAIN}/${mangaId}`;
    }
    async getHomePageSections(sectionCallback) {
        const requestForRecent = createRequestObject({
            url: `${BD_DOMAIN}`,
            method: 'GET'
        });
        const responseForRecent = await this.requestManager.schedule(requestForRecent, 1);
        const $recent = this.cheerio.load(responseForRecent.data);
        const requestForHot = createRequestObject({
            url: `${BD_DOMAIN}/hot`,
            method: 'GET'
        });
        const responseForHot = await this.requestManager.schedule(requestForHot, 1);
        const $hot = this.cheerio.load(responseForHot.data);
        const recentAlbumsSection = createHomeSection({ id: 'recent', title: 'Recently Uploaded', view_more: true, type: paperback_extensions_common_1.HomeSectionType.singleRowNormal });
        const hotAlbumsSection = createHomeSection({ id: 'hot', title: 'Hot', view_more: true, type: paperback_extensions_common_1.HomeSectionType.singleRowNormal });
        (0, BuonduaParser_1.parseHomeSections)($recent, sectionCallback, recentAlbumsSection);
        (0, BuonduaParser_1.parseHomeSections)($hot, sectionCallback, hotAlbumsSection);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 0;
        let param = '';
        switch (homepageSectionId) {
            case 'recent':
                param = `/?start=${page}`;
                break;
            case 'hot':
                param = `/hot?start=${page}`;
                break;
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist');
        }
        const request = createRequestObject({
            url: `${BD_DOMAIN}`,
            method: 'GET',
            param
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        const albums = (0, BuonduaParser_1.parseViewMore)($);
        metadata = { page: page + 20 };
        return createPagedResults({
            results: albums,
            metadata
        });
    }
    async getMangaDetails(mangaId) {
        const data = await (0, BuonduaParser_1.getGalleryData)(mangaId, this.requestManager, this.cheerio);
        const status = paperback_extensions_common_1.MangaStatus;
        return createManga({
            id: mangaId,
            titles: data.titles,
            image: data.image,
            status: paperback_extensions_common_1.MangaStatus.UNKNOWN,
            langFlag: paperback_extensions_common_1.LanguageCode.UNKNOWN,
            author: 'Buondua',
            artist: 'Buondua',
            tags: data.tags,
            desc: undefined,
        });
    }
    async getChapters(mangaId) {
        const data = await (0, BuonduaParser_1.getGalleryData)(mangaId, this.requestManager, this.cheerio);
        const chapters = [];
        chapters.push(createChapter({
            id: encodeURI(data.id),
            mangaId,
            name: 'Album',
            langCode: paperback_extensions_common_1.LanguageCode.UNKNOWN,
            chapNum: 1,
            time: new Date(),
        }));
        return chapters;
    }
    async getChapterDetails(mangaId, chapterId) {
        // return createChapterDetails({
        //     id: encodeURI(chapterId),
        //     mangaId: mangaId,
        //     longStrip: false,
        //     pages: await getPages(mangaId, this.requestManager, this.cheerio)
        // })
        throw new Error("Not Implemented");
    }
    async getSearchResults(query, metadata) {
        throw new Error("Not Implemented");
    }
}
exports.Buondua = Buondua;
