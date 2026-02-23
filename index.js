const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const data = require("./data.json");
const messages = require("./messages.json");
const path = require('path');

const images = data.characters.map(character => fs.readFileSync(path.join(__dirname, character.image)));

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, messages['start'], {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{text: messages['choose-btn'], callback_data: 'random_character'}]
            ]
        }
    });
});

bot.on('callback_query', (query) => {
    if (query.data === 'random_character') {
        if(Object.keys(data.selected).length === data.characters.length) {
            return bot.sendMessage(query.message.chat.id, messages['all-selected'], {
                parse_mode: 'HTML',
            });
        }

        if(Object.values(data.selected).includes(query.from.username)) {
            return bot.sendMessage(query.message.chat.id, messages['already-selected'], {
                parse_mode: 'HTML',
            });
        }

        let randomIndex;
        do {
            randomIndex = randomNumber(0, data.characters.length);
        } while (Object.keys(data.selected).includes(randomIndex.toString()));

        data.selected[randomIndex.toString()] = query.from.username;
        writeJsonToFile('./data.json', data);
        
        bot.sendPhoto(query.message.chat.id, images[randomIndex], {
            parse_mode: 'HTML',
            has_spoiler: true,
            caption: messages['choosen-character'].replace('{{name}}', data.characters[randomIndex].name),
        });
    }
});

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function writeJsonToFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
}