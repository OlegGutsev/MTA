/*eslint no-unused-vars: 0, no-shadow: 0, new-cap: 0, dot-notation:0, no-use-before-define:0 */
/*eslint-env node, es6 */
"use strict";


//HERE we export some methods
module.exports = {
    getInnerProperty: getInnerProperty,

    checkAjaxAuth: checkAjaxAuth,
    getAjaxUser: getAjaxUser,
    getAjaxLang: getAjaxLang,

    checkOdataAuth: checkOdataAuth,
    getOdataUser: getOdataUser,
    getOdataLang: getOdataLang
};

/**
 * @param req
 * @param scope
 * @throws CMN_Forbidden
 */
function checkAjaxAuth(req, scope) {
    if (scope === null || process.argv[2] === "--debug") {
        return;
    }

    if (!req.attr.checkScope(`${req.attr.xsappname}.${scope}`)) {
        throw new Error(`User doesn't have that scope: ${req.attr.xsappname}.${scope}`);
    }
}

/**
 * @param req
 * @param scope
 * @throws CMN_Forbidden
 */
function checkOdataAuth(req, scope) {
    if (scope === null || process.argv[2] === "--debug") {
        return;
    }

    if (!req.attr.checkScope(`${req.attr.xsappname}.${scope}`)) {
        throw new Error(`User doesn't have that scope: ${req.attr.xsappname}.${scope}`);
    }
}


/**
 * @param req
 * @throws CMN_UserNotDefined
 */
function getOdataUser(req) {
    if (process.argv[2] === "--debug") {
        return "debugUser";
    }

    const fio = getInnerProperty(["user", "name", "familyName"], req, '') +
        " " + getInnerProperty(["user", "name", "givenName"], req, '');
    const email = getInnerProperty(["user", "emails", 0, "value"], req, undefined);

    const user = fio !== " " ? fio : email;
    if (!user) {
        throw new Error("User was not recognized");
    }
    return user;
}

/**
 * @param req
 * @throws CMN_UserNotDefined
 */
function getAjaxUser(req) {
    if (process.argv[2] === "--debug") {
        return "debugUser";
    }

    const fio = getInnerProperty(["authInfo", "userInfo", "familyName"], req, '') +
        " " + getInnerProperty(["authInfo", "userInfo", "givenName"], req, '');
    const email = getInnerProperty(["authInfo", "userInfo", "email"], req, undefined);

    const user = fio !== " " ? fio : email;
    console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU");
    console.log(fio);
    console.log(email);
    console.log(user);
    console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU");
    if (!user) {
        throw new Error("User was not recognized");
    }
    return user;
}


/**
 * @param req
 */
function getOdataLang(req) {
    if (process.argv[2] === "--debug") {
        return "en";
    }

    const lang = getInnerProperty(["user", "locale"], req, 'en');
    return lang.toLowerCase();
}

/**
 * @param req
 */
function getAjaxLang(req) {
    if (process.argv[2] === "--debug") {
        return "en";
    }

    const langparser = require("accept-language-parser");
    const lang = req.headers["accept-language"];
    if (!lang) {
        return "en";
    }
    const arr = langparser.parse(lang);
    if (!arr || arr.length < 1) {
        return "en";
    }
    return arr[0].code;
}


/**
 * @param props
 * @param obj
 * @param nul
 */
function getInnerProperty(props, obj, nul) {
    return props.reduce((xs, x) => (xs && xs[x]) ? xs[x] : nul, obj);
}

