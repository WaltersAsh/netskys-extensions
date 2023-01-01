import {
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    PagedResults,
    Section,
    SourceInfo,
    TagSection,
    TagType,
    Request,
    RequestManager,
    ContentRating,
    Response,
    MangaStatus,
    LanguageCode,
    HomeSectionType
} from 'paperback-extensions-common';

import { parseHomeSections } from './BuonduaParser'

const BD_DOMAIN = 'https://buondua.com'

export const BuonduaInfo: SourceInfo = {
    version: '1.0.1',
    name: 'Buon Dua',
    icon: 'icon.png',
    author: 'WaltersAsh',
    authorWebsite: 'https://github.com/WaltersAsh',
    description: 'Extension to grab albums from Buon Dua',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: BD_DOMAIN,
    sourceTags: [
        {
            text: '18+',
            type: TagType.RED
        }
    ]
}

export class Buondua extends Source {
    readonly requestManager: RequestManager = createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
                        'referer': BD_DOMAIN
                    }
                }
                return request;
            },
            
            interceptResponse: async (response: Response): Promise<Response> => { 
                return response; 
            }
        }
    })

    override getMangaShareUrl(mangaId: string): string {
        return `${BD_DOMAIN}${mangaId}`;
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
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

        const recentAlbumsSection = createHomeSection({ id: 'recent_albums', title: 'Recently Uploaded', view_more: true, type: HomeSectionType.singleRowNormal });
        const hotAlbumsSection = createHomeSection({ id: 'hot_albums', title: 'Hot', view_more: true, type: HomeSectionType.singleRowNormal });

        parseHomeSections($recent, sectionCallback, recentAlbumsSection);
        parseHomeSections($hot, sectionCallback, hotAlbumsSection);
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        throw new Error("Not Implemented");
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        throw new Error("Not Implemented");
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        throw new Error("Not Implemented");
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        throw new Error("Not Implemented");
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        throw new Error("Not Implemented");
    }
}