import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';
import { promises as fsa } from 'fs';
import path from 'path';
import { categories } from './constants.js';
import { EmojiModel } from './models/index.js';

function defined<T>(arg: T | null | undefined): arg is T {
  return arg !== null;
}

export class Emojis {
  private emojisPath: string;
  private emojis: EmojiModel[] = [];
  private logger: debug.Debugger = debug('emojis');
  private numbersLogger: debug.Debugger = this.logger.extend('numbers');
  private allLogger: debug.Debugger = this.logger.extend('all');

  constructor() {
    this.emojisPath = path.join(process.cwd(), 'emojis.json');
    fsa
      .readFile(this.emojisPath)
      .then(content => content.toString('utf-8'))
      .then(JSON.parse)
      .then(emojis => (this.emojis = emojis));
  }

  /**
   * Update emojis' file manually
   */
  public async updateEmojis() {
    const emojis: EmojiModel[] = [];
    for (const category of categories) {
      this.logger(
        'Getting all emojis of:',
        `https://emojipedia.org/${category.url}`
      );
      const html = await this.fetchHtmlOfCategory(category.url);
      const $ = cheerio.load(html);
      const elementsFetchJobs: cheerio.Element[] = [];
      $('.emoji-list li a').each((i, element) => {
        elementsFetchJobs.push(element);
      });
      const emojisList = await Promise.all(
        elementsFetchJobs.map(job => this.fetchEmoji($, job))
      );
      emojis.push(...emojisList.filter(defined));
      this.numbersLogger(`Loaded ${emojis.length} emojis`);
    }

    if (emojis.length !== this.emojis.length) {
      this.logger(`Writing emojis (${emojis.length}) at:`, 'emojis.json');
      fsa.writeFile('emojis.json', JSON.stringify(emojis));
    }
  }

  private async fetchEmoji(
    $: cheerio.Root,
    emojiData: cheerio.Element
  ): Promise<EmojiModel | null> {
    const nameData: string[] = $(emojiData).text().split(' ');
    nameData.shift();
    const name = nameData.join(' ');
    const nameUrl = $(emojiData).attr('href')?.replace(/\/$/g, '');
    const emoji = $(emojiData).children('span.emoji').text();
    this.allLogger('Fetching:', name);
    if (nameUrl) {
      this.allLogger('Getting valid emoji, fetching unicode and short names');
      return Promise.all([
        this.fetchUnicodeFromName(nameUrl),
        this.fetchShortNamesFromName(nameUrl),
      ]).then(([unicode, shortNames]) => {
        this.allLogger('Got a valid emoji:', {
          name,
          nameUrl,
          emoji,
          unicode,
          shortNames,
        });
        return {
          name,
          nameUrl,
          emoji,
          unicode,
          shortNames,
        };
      });
    }
    this.allLogger('Issue when getting the emoji, returning null');
    return null;
  }

  /**
   * Find an emoji matching the unicode, name, shortNames or nameUrl.
   * @param value The value of the emoji as string
   * @returns The {@link EmojiModel} found.
   */
  public getEmoji(value: string): EmojiModel | undefined {
    value = value.toLowerCase();
    return this.emojis.find(emoji => {
      return (
        emoji.unicode.toLowerCase() === value ||
        emoji.name.toLowerCase() === value ||
        emoji.shortNames.includes(
          ':' + value.replace(/(^\:|\:$)/g, '') + ':'
        ) ||
        emoji.nameUrl === value
      );
    });
  }

  /**
   * Get all emojis list
   * @returns The list of all {@link EmojiModel} list
   */
  public getEmojis(): EmojiModel[] {
    return this.emojis;
  }

  private async fetchUnicodeFromName(nameUrl: string): Promise<string> {
    return axios
      .get(`https://emojipedia.org/${nameUrl}/`)
      .then(({ data }) => data)
      .then(html => {
        const $ = cheerio.load(html);
        return $('a[href^="/emoji/"]').first().text().split(' ')[1];
      })
      .catch(() => this.fetchUnicodeFromName(nameUrl));
  }

  private async fetchShortNamesFromName(nameUrl: string): Promise<string[]> {
    return axios
      .get(`https://emojipedia.org/${nameUrl}/`)
      .then(({ data }) => data)
      .then(html => {
        const $ = cheerio.load(html);
        const shortNames: string[] = [];
        $('.shortcode').each((i, emojiData) => {
          shortNames.push($(emojiData).text());
        });
        return shortNames;
      })
      .catch(() => this.fetchShortNamesFromName(nameUrl));
  }

  private async fetchHtmlOfCategory(categoryUrl: string): Promise<string> {
    return axios
      .get(`https://emojipedia.org/${categoryUrl}`)
      .then(({ data }) => data)
      .catch(() => this.fetchHtmlOfCategory(categoryUrl));
  }
}
