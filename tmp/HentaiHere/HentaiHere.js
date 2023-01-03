"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HentaiHere = exports.HentaiHereInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const HentaiHereParser_1 = require("./HentaiHereParser");
const HH_DOMAIN = 'https://hentaihere.com';
exports.HentaiHereInfo = {
    version: '2.0.0',
    name: 'HentaiHere',
    icon: 'icon.png',
    author: 'Netsky',
    authorWebsite: 'https://github.com/TheNetsky',
    description: 'Extension that pulls manga from HentaiHere',
    contentRating: paperback_extensions_common_1.ContentRating.ADULT,
    websiteBaseURL: HH_DOMAIN,
    sourceTags: [
        {
            text: '18+',
            type: paperback_extensions_common_1.TagType.YELLOW
        }
    ]
};
class HentaiHere extends paperback_extensions_common_1.Source {
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
                            'referer': `${HH_DOMAIN}/`
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
    getMangaShareUrl(mangaId) { return `${HH_DOMAIN}/m/${mangaId}`; }
    async getMangaDetails(mangaId) {
        const request = createRequestObject({
            url: `${HH_DOMAIN}/m/${mangaId}`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, HentaiHereParser_1.parseMangaDetails)($, mangaId);
    }
    async getChapters(mangaId) {
        const request = createRequestObject({
            url: `${HH_DOMAIN}/m/${mangaId}`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, HentaiHereParser_1.parseChapters)($, mangaId);
    }
    async getChapterDetails(mangaId, chapterId) {
        const request = createRequestObject({
            url: `${HH_DOMAIN}/m/${mangaId}/${chapterId}/1`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        return (0, HentaiHereParser_1.parseChapterDetails)(response.data, mangaId, chapterId);
    }
    async getHomePageSections(sectionCallback) {
        const request = createRequestObject({
            url: HH_DOMAIN,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        (0, HentaiHereParser_1.parseHomeSections)($, sectionCallback);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
        let param = '';
        switch (homepageSectionId) {
            case 'newest':
                param = `/directory/newest?page=${page}`;
                break;
            case 'trending':
                param = `/directory/trending?page=${page}`;
                break;
            case 'staff_pick':
                param = `/directory/staff_pick?page=${page}`;
                break;
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist');
        }
        const request = createRequestObject({
            url: HH_DOMAIN,
            method: 'GET',
            param
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        const manga = (0, HentaiHereParser_1.parseViewMore)($);
        metadata = !(0, HentaiHereParser_1.isLastPage)($) ? { page: page + 1 } : undefined;
        return createPagedResults({
            results: manga,
            metadata
        });
    }
    async getSearchTags() {
        const request = createRequestObject({
            url: `${HH_DOMAIN}/tags/category`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        return (0, HentaiHereParser_1.parseTags)($);
    }
    async getSearchResults(query, metadata) {
        const page = metadata?.page ?? 1;
        let request;
        if (query.title) {
            request = createRequestObject({
                url: `${HH_DOMAIN}/search?s=`,
                method: 'GET',
                param: `${encodeURI(query.title)}&page=${page}`
            });
        }
        else {
            request = createRequestObject({
                url: `${HH_DOMAIN}`,
                method: 'GET',
                param: `/search/${query?.includedTags?.map((x) => x.id)[0]}/most-popular?page=${page}`
            });
        }
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        const manga = (0, HentaiHereParser_1.parseSearch)($);
        metadata = !(0, HentaiHereParser_1.isLastPage)($) ? { page: page + 1 } : undefined;
        return createPagedResults({
            results: manga,
            metadata
        });
    }
    CloudFlareError(status) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > <The name of this source> and press Cloudflare Bypass');
        }
    }
    getCloudflareBypassRequest() {
        return createRequestObject({
            url: HH_DOMAIN,
            method: 'GET'
        });
    }
}
exports.HentaiHere = HentaiHere;
