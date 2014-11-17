var ui = require("sdk/ui");
var tabs = require("sdk/tabs");
var clipboard = require("sdk/clipboard");
var generateRandomString = require("./random-string-generator").generateRandomString;
var self = require("sdk/self");
var prefSet = require("sdk/simple-prefs");

var port = (function () {
    // パスワードを生成して、返す
    function generatePassword(length, useNumbers, useUpperCaseCharacters, additinals) {
        return generateRandomString(length, useNumbers, useUpperCaseCharacters, additinals);
    }

    function insertPassToContent(password) {
        tabs.activeTab.attach({
            // jsファイルをロードして、引数を渡して実行
            contentScript: '(function(arg){'
            + self.data.load('insert-pass.js')
            + '})("' + password + '")'
        });
    }

    return {
        "generatePassword": generatePassword,
        "insertPassToContent": insertPassToContent
    }
})();
// アドオンバーにアイコン表示
var widget = ui.ActionButton({
    id: "efcl-passwordgen",
    label: "Password generator",
    icon: self.data.url('keyicon.png'),
    onClick: function () {
        var prefs = prefSet.prefs;
        var passLength = prefs.passLength,
            useNumbers = prefs.useNumbers,
            useUpperCaseCharacters = prefs.useUpperCaseCharacters,
            additionalCharacters = prefs.additionalCharacters.split("");
        var password = port.generatePassword(passLength, useNumbers, useUpperCaseCharacters, additionalCharacters);
        // クリップボードにコピーする
        clipboard.set(password, "text");
        port.insertPassToContent(password);
    }
});
// 設定
function onPrefChange(prefName) {
    console.log("The " + prefName +
        " preference changed, current value is: " +
        prefSet.prefs[prefName]
    );
}

prefSet.on("stringPreference", onPrefChange);