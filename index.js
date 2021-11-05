const TelegramBot = require('node-telegram-bot-api');

const token = '';

const bot = new TelegramBot(token, {
    polling: true
});

class Good {
    #name;
    #price;
    constructor(name, price) {
        this.#name = name;
        this.#price = price;
    }
    getName = () => "*" + this.#name + "*";
    getNameList = () => this.#name;
    getPrice = () => this.#price;
    print = () => {
        return this.getName() +
            `\n\n` + this.getPrice();
    }

}

let order = {};

let goods = [new Good('Спирт', '5л - 850грн\n10л - 800грн\n20л - 1500грн\n40-80л - по 65 грн / 1 л\n100-200л - по 60  / 1 л\n\nДля більших об\'ємів - ціна договірна'),
    new Good('Горілка на розлив', '5-20л - 60 грн / 1 л\n40л - 50 грн / 1 л\n60-80л - 45 грн / 1 л\n100л - 40грн / 1 л\n200л і більше, 35 грн / 1 л'),
    new Good('Горілка 2л в тетрапаці', 'Фінляндія за смаком смородини\nФінляндія за смаком журавлини\nФінляндія за смаком лайма\nФінляндія за смаком грейпфрута\n\nПо 250грн за штуку'),
    new Good('Горілка 3л в тетрапаці', 'Фінляндія мятна\nАбсолютний стандарт\n\nПо 250грн за штуку'),
    new Good('Горілка 10л в тетрапаці (з краником)', '1-2\tшт по 400грн за штуку\n5\tшт по 350грн за штуку\n10\tшт по 300грн за штуку\n\nДля більшої кількості - ціна договірна'),
    new Good('Зубрівка', '5-20л - 80 грн / 1 л\n40л - 70грн / 1л\n60-80л - 65 грн / 1 л\n100л - 60 / 1 л'),
    new Good('Коньяк класичний', '5-20л - 70 грн / 1 л\n40л - 60 грн \ 1 л\n60-80л - 60 грн / 1 л\n100л - 50 грн / 1 л\n200л - 45 грн / 1 л'),
    new Good('Коньяк шоколадний', '5-20л - 70 грн / 1 л\n40л - 60 грн \ 1 л\n60-80л - 60 грн / 1 л\n100л - 50 грн / 1 л\n200л - 45 грн / 1 л'),
    new Good('Коньяк мигдальний', '5-20л - 70 грн / 1 л\n40л - 60 грн \ 1 л\n60-80л - 60 грн / 1 л\n100л - 50 грн / 1 л\n200л - 45 грн / 1 л'),
    new Good('Коньяк в тетрапаці 2л', 'Courvoisier\nMetaxa\nKVINT\n\nПо 300 грн за штуку'),
    new Good('Віскі в тетрапаці 2л', 'Chivas 12\nJack Denials \nJack Denials Медовий\nJameson\n\nПо 300 грн за штуку')
];

let keyboard = [];

const buyKeys = [
    [{
        text: "🍾Купити",
        callback_data: `buyItem`
    }],
    [{
        text: "❌Сховати",
        callback_data: "delete"
    }]
];

for (let i = 0; i < goods.length; i++) {
    keyboard.push([{
        text: goods[i].getNameList(), // текст на кнопці
        callback_data: `item${i}` // дані для обробника подій
    }]);
}

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    for (let i = 0; i < keyboard.length; i++) {
        if (query.data === `item${i}`) {
            bot.sendPhoto(chatId, `item${i}.jpg`, {
                caption: `${goods[i].print()}`,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: buyKeys
                }
            });
            break;
        }
    }

    if (query.data === `buyItem`) {
        let tempObj = {
            text: query.message.caption.split('\n')[0],
            count: true,
            name: false,
            contactNum: false,
            address: false,
        }
        order[chatId] = tempObj;
        bot.sendMessage(chatId, 'Введіть кількість: ');
    }

    if (query.data === `delete`) {
        try {
            bot.deleteMessage(chatId, query.message.message_id);
        } catch (err) {
            console.log(err.message);
        }
    }

});


bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    try {
        if (msg.text != "/start" && order[chatId]["count"] == true && !isNaN(msg.text)) {
            order[chatId]["text"] += "\nКількість: " + msg.text;
            order[chatId]["count"] = false;
            order[chatId]["name"] = true;
            bot.sendMessage(chatId, 'Введіть Ваш ПІП: ');
        } else if (msg.text != "/start" && order[chatId]["name"]) {
            order[chatId]["text"] += "\nІм\'я: " + msg.text;
            order[chatId]["name"] = false;
            order[chatId]["contactNum"] = true;
            bot.sendMessage(chatId, 'Введіть ваш номер телефону: ');
        } else if (msg.text != "/start" && order[chatId]["contactNum"]) {
            order[chatId]["text"] += "\nНомер телефону: " + msg.text;
            bot.sendMessage(chatId, 'Введіть адресу відправки у форматі [Місто, адреса, номер відділення Нової Пошти]: ');
            order[chatId]["contactNum"] = false;
            order[chatId]["address"] = true;
        } else if (msg.text != "/start" && order[chatId]["address"]) {
            order[chatId]["text"] += "\nАдреса відправки: " + msg.text;
            order[chatId]["address"] = false;
            bot.sendMessage(chatId, 'Дякуємо за замовлення, найближчим часом з Вами зв\'яжеться наш модератор для підтвердження замовлення,');
            bot.sendMessage(1270066483, order[chatId]["text"]);
        } else if (msg.text != "/start" && order[chatId]["count"] == true && isNaN(msg.text)) {
            bot.sendMessage(chatId, 'Введіть кількість: ');
        }
    } catch (err) {
        console.log(err.message);
    }
});

bot.on("polling_error", console.log);

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привіт, наш магазин займається продажом *Горілчаних виробів*, обери товар, який тобі до вподоби: ', {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
});