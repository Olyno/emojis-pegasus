import axios from 'axios';
import cheerio from 'cheerio';
import fs, { promises as fsa } from 'fs';
import path from 'path';
import { categories } from './constants';
import { EmojiModel } from './models/emoji.model';

export class Emojis {

    private emojisPath: string
    private emojis: EmojiModel[] = [];

    constructor () {
        this.emojisPath = path.join(process.cwd(), 'emojis.json');
        this.setupEmojis();
    }

    async setupEmojis() {
        if (!fs.existsSync(this.emojisPath)) {
            for (const category of categories) {
                console.log('[emojis-pegasus] Getting all emojis of:', `https://emojipedia.org/${category.url}`)
                const html = await this.getHtmlOfCategory(category.url);
                if (html) {
                    const $ = cheerio.load(html);
                    $('.emoji-list li').each(async (i, emojiData) => {
                        const name = $(emojiData).children('a').text().split(' ')[1];
                        const nameUrl = $(emojiData).children('a').attr('href')?.slice(1, -1);
                        if (nameUrl) {
                            const emoji: EmojiModel = {
                                name: name,
                                nameUrl: nameUrl,
                                emoji: $(emojiData).text().split(' ')[0],
                                unicode: await this.getUnicodeFromName(nameUrl),
                                shortNames: await this.getShortNamesFromName(nameUrl)
                            }
                            this.emojis.push(emoji);
                        }
                    });
                }
            }
            console.log('[emojis-pegasus] Writing emojis at:', 'emojis.json');

            fsa.writeFile('emojis.json', JSON.stringify(this.emojis));
        } else {
            this.emojis = require(this.emojisPath);
        }

    }

    getEmoji(value: string) {
        return this.emojis.find(emoji => {
            return emoji.unicode === value
                || emoji.nameUrl === value
                || emoji.name === value.toLowerCase()
                || emoji.shortNames.includes(':' + value.replace(/(^\:|\:$)/g, '') + ':')
        });
    }

    async getUnicodeFromName(name: string): Promise<string> {
        const nameUrl = name.toLowerCase().replace(' ', '');
        return axios.get(`https://emojipedia.org/${nameUrl}/`)
            .then(({ data }) => data)
            .then(html => {
                const $ = cheerio.load(html);
                return $('a[href^="/emoji/"]').text().split(' ')[1].replace(/(code)$/g, '');
        }).catch(() => this.getUnicodeFromName(name));
    }

    async getShortNamesFromName(name: string): Promise<string[]> {
        const nameUrl = name.toLowerCase().replace(' ', '');
        return axios.get(`https://emojipedia.org/${nameUrl}/`)
            .then(({ data }) => data)
            .then(html => {
                const $ = cheerio.load(html);
                const shortNames: string[] = [];
                $('.shortcode').each((i, emojiData) => {
                    shortNames.push($(emojiData).text())
                });
                return shortNames;
        }).catch(() => this.getShortNamesFromName(name));
    }

    async getHtmlOfCategory(categoryUrl: string): Promise<string> {
        return axios.get(`https://emojipedia.org/${categoryUrl}`)
            .then(({ data }) => data)
            .catch(() => this.getHtmlOfCategory(categoryUrl));
    }

    getEmojis() {
        return this.emojis;   
    }

}