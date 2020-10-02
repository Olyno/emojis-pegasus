# emoji-list

![GitHub last commit](https://img.shields.io/github/last-commit/Olyno/emojis-list?style=flat-square) ![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Olyno/emojis-list/Check%20if%20build?style=flat-square) ![GitHub](https://img.shields.io/github/license/Olyno/emojis-list?style=flat-square)

All emojis based on [Emojipedia](https://emojipedia.org) up to date automatically each weeks.

## Install

**npm:** ``npm i @olyno/emojis-list``

**yarn:** ``yarn add @olyno/emojis-list``

**Other:** simply fetch at ``https://raw.githubusercontent.com/Olyno/emojis-list/master/emojis.json``

## Usage

```js
const emojisList = require('@olyno/emojis-list').default;
const emojis = emojisList.getEmojis();

// Get a specific emoji
const brainEmoji = emojisList.getEmoji('brain');
const brainEmoji = emojisList.getEmoji(':brain:');
const brainEmoji = emojisList.getEmoji('🧠');
const brainEmoji = emojisList.getEmoji('U+1F9E0');

// Get values
console.log('Emoji name:', brain.name)
console.log('Emoji unicode:', brain.unicode)
console.log('Emoji shortNames:', brain.shortNames)
```

An emoji looks like that:

```ts
{
    name: string;
    nameUrl: string;
    emoji: string;
    unicode: string;
    shortNames: string[]; 
}
```

**Example:**

```ts
{
    name: "Man",
    nameUrl: "man-raising-hand",
    emoji: "🙋‍♂️",
    unicode: "U+1F64B‍",
    shortNames: [":man_raising_hand:",":man-raising-hand:",":raising_hand_man:"]
}
```

## Buy me a ko-fi

Whether you use this project, have learned something from it, or just like it, please consider supporting it by buying me a coffee, so I can dedicate more time on open-source projects like this 😉 (personally I prefer hot chocolate but whatever)

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/olyno)

## License

Code released under GNU GPLv3 license.

Copyright ©, [Olyno](https://github.com/Olyno).