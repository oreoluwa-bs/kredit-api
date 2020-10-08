const UssdMenu = require('ussd-menu-builder');
const translate = require('translate-google');
const { te } = require('translate-google/languages');

let menu = new UssdMenu();

const languages = {
    '1': 'en',
    '2': 'yo',
    '3': 'ig',
    '4': 'ha',
}

agentLocation = 'Lagos';
number = '080999999999';

let sessions = {};

menu.sessionConfig({
    start: (sessionId) => {
        return new Promise((resolve, reject) => {
            if (!(sessionId in sessions)) sessions[sessionId] = {};
            resolve();
        });

    },
    end: (sessionId) => {
        return new Promise((resolve, reject) => {
            delete sessions[sessionId];
            resolve();
        });
    },
    set: (sessionId, key, value) => {
        return new Promise((resolve, reject) => {
            sessions[sessionId][key] = value;
            resolve(value);
        });
    },
    get: (sessionId, key) => {
        return new Promise((resolve, reject) => {
            let value = sessions[sessionId][key];
            resolve(value);
        });
    }
});

menu.startState({
    run: async () => {
        let session = menu.session;

        await session.start();

        menu.con('Welcome. Choose a language option:' +
            '\n1. English' +
            '\n2. Yoruba' +
            '\n3. Igbo' +
            '\n4. Hausa');

    },
    // next object links to next state based on user input
    next: {
        '1': 'selectLanguage',
        '2': 'selectLanguage',
        '3': 'selectLanguage',
        '4': 'selectLanguage'
    }
});

// lANGUAGEE
menu.state('selectLanguage', {
    run: async () => {
        let languageOption = menu.val;
        let session = menu.session;


        await session.set('language', languages[languageOption]);

        const text = await translate('What is your name:', { to: languages[languageOption] });
        menu.con(text);

    },
    next: {
        '*[a-zA-Z]+': 'selectLanguage.name'
    }
});

// NAME
menu.state('selectLanguage.name', {
    run: async () => {
        let name = menu.val;
        let session = menu.session;

        await session.set('name', name)
        const lang = await session.get('language');

        const text = await translate('What type of business do you run:', { to: lang });
        menu.con(text);
    },
    next: {
        '*[a-zA-Z]+': 'selectLanguage.business'
    }
});

// BUSINESS
menu.state('selectLanguage.business', {
    run: async () => {
        let business = menu.val;
        let session = menu.session;

        await session.set('business', business);
        const lang = await session.get('language');

        const text = await translate('Where do you live:', { to: lang });
        menu.con(text);
    },
    next: {
        '*[a-zA-Z]+': 'selectLanguage.location'
    }
});


// LOCATION
menu.state('selectLanguage.location', {
    run: async () => {
        let location = menu.val;
        let session = menu.session;

        await session.set('location', location);
        const lang = await session.get('language');

        const bankText = await translate('Do you have a bank:' +
            '\n1. Yes' +
            '\n2. No', { to: lang });

        menu.con(bankText)

    },
    next: {
        '1': 'I_Have_Bank',
        '2': 'I_Have_Bank',
    }
});


menu.state('I_Have_Bank', {
    run: async () => {
        let bank = menu.val;
        let session = menu.session;

        await session.set('bank', bank == '1' ? true : false)
        const lang = await session.get('language');

        const text = await translate(`Please come to the Agent banker located at ${agentLocation} on Monday - Friday from 10:00am to 04:00pm` +
            '\n' +
            '\nPlease come with the following:' +
            '\nRecent utility bill' +
            '\nGuarantor\'s details' +
            '\nSavings history from cooperative society like Ajo or Esusu' +
            '\n' +
            `\nYou can dial ${number}, for further enquiries`, { to: lang });

        menu.end(text);
    }
});

// Registering USSD handler with Expresss
exports.runUSSD = async (req, res) => {
    let args = {
        phoneNumber: req.body.phoneNumber,
        sessionId: Math.floor(Math.random() * 100),
        serviceCode: req.body.serviceCode,
        text: req.body.text
    };
    let resMsg = await menu.run(args);
    res.send(resMsg);
};
