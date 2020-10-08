const UssdMenu = require('ussd-menu-builder');
const translate = require('translate-google');

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
            try {
                if (!(sessionId in sessions)) sessions[sessionId] = {};
                resolve();
            } catch (error) {
                reject(error);
            }
        });

    },
    end: (sessionId) => {
        return new Promise((resolve, reject) => {
            try {
                delete sessions[sessionId];
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    },
    set: (sessionId, key, value) => {
        return new Promise((resolve, reject) => {
            try {
                sessions[sessionId][key] = value;
                resolve(value);
            } catch (error) {
                reject(error);
            }
        });
    },
    get: (sessionId, key) => {
        return new Promise((resolve, reject) => {
            try {
                let value = sessions[sessionId][key];
                resolve(value);
            } catch (error) {
                reject(error);
            }
        });
    }
});

menu.startState({
    run: () => {
        menu.session.start(sessions[menu.args.sessionId]).then(() => {
            menu.con('Welcome. Choose a language option:' +
                '\n1. English' +
                '\n2. Yoruba' +
                '\n3. Igbo' +
                '\n4. Hausa')
        });
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
    run: () => {
        let languageOption = menu.val;
        let session = sessions[menu.args.sessionId];

        menu.session.set(session, 'language', languages[languageOption]).then(() => {
            translate('What is your name:', { to: languages[languageOption] }).then(res => {
                menu.con(res)
            });
        });
    },
    next: {
        '*[a-zA-Z]+': 'selectLanguage.name'
    }
});

// NAME
menu.state('selectLanguage.name', {
    run: () => {
        let name = menu.val;
        let session = sessions[menu.args.sessionId];
        menu.session.set(session, 'name', name).then(() => {
            translate('What type of business do you run:', { to: languages[session.get('language')] }).then(res => {
                menu.con(res)
            });
        });
    },
    next: {
        '*[a-zA-Z]+': 'selectLanguage.business'
    }
});

// BUSINESS
menu.state('selectLanguage.business', {
    run: () => {
        let business = menu.val;
        let session = sessions[menu.args.sessionId];
        menu.session.set(session, 'business', business).then(() => {
            translate('Where do you live:', { to: languages[session.get('language')] }).then(res => {
                menu.con(res)
            });
        });
    },
    next: {
        '*[a-zA-Z]+': 'selectLanguage.location'
    }
});


// LOCATION
menu.state('selectLanguage.location', {
    run: () => {
        let location = menu.val;
        let session = sessions[menu.args.sessionId];
        menu.session.set(session, 'location', location).then(() => {
            translate('Do you have a bank:' +
                '\n1. Yes' +
                '\n2. No', { to: languages[session.get('language')] }).then(res => {
                    menu.con(res)
                });
        });
    },
    next: {
        '1': 'I_Have_Bank',
        '2': 'I_Have_Bank',
    }
});


menu.state('I_Have_Bank', {
    run: () => {
        let bank = menu.val;
        let session = sessions[menu.args.sessionId];

        // Upload to DATABASE
        menu.session.set(session, 'bank', iHaveBank[bank] == '1' ? true : false).then(() => {
            // End
            translate(`Please come to the Agent banker located at ${agentLocation} on Monday - Friday from 10:00am to 04:00pm` +
                '\n' +
                '\nPlease come with the following:' +
                '\nRecent utility bill' +
                '\nGuarantor\'s details' +
                '\nSavings history from cooperative society like Ajo or Esusu' +
                '\n' +
                `\nYou can dial ${number}, for further enquiries`, { to: languages[sessions.get(session, 'location')] }).then(res => {
                    menu.end(res)
                });
        });
    }
});

// Registering USSD handler with Expresss
const runUSSD = async (req, res) => {
    let args = {
        phoneNumber: req.body.phoneNumber,
        sessionId: req.body.sessionId,
        serviceCode: req.body.serviceCode,
        text: req.body.text
    };
    let resMsg = await menu.run(args);
    res.send(resMsg);
};

module.exports = { runUSSD };
