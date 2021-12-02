var urls = [];
var valid = [];
var errors = [];

// Get all final urls
getUniqueAdUrls();

urls.forEach(function(url, index) {

    if(index == 0) {
        Logger.log('   [' + (index + 1) + '/' + urls.length + '] Fetching ' + url + '...');
    } else if(Number.isInteger((index + 1) / config.loggerSteps)) {
        Logger.log('   [' + (index + 1) + '/' + urls.length + '] Fetching ' + url + '...');
    }

    var code = UrlFetchApp.fetch(url, {
        muteHttpExceptions : true
    }).getResponseCode();

    if(code <= 200 || code >= 400) {
        errors.push([url, code])
    } else {
        valid.push([url, code])
    }

});

if(errors.length) {
    sendErrorMail(errors);
} else {
    Logger.log('   CHECK OF ' + getLength(valid) + ' COMPLETED - No errors occured');
}

/**
 * Main Function Stack
 **/

function getUniqueAdUrls() {
    Logger.log('   Getting all unique urls...');
    var ads = AdsApp.ads()
        .withCondition("Status = ENABLED")
        .withCondition("CampaignStatus = ENABLED")
        .withCondition("AdGroupStatus = ENABLED")
        .get();
    while(ads.hasNext()) {
        var ad = ads.next();
        if(ad.getType() != "EXPANDED_DYNAMIC_SEARCH_AD") {
            var final_url = ad.urls().getFinalUrl();
            if(final_url != null) {
                if(config.stripParameters) {
                    final_url = final_url.split("?")[0];
                }
                if(urls.indexOf(final_url) == -1) {
                    urls.push(final_url);
                }
            }
        }
    }
    Logger.log('   Got all unique urls [' + urls.length + ']...');
}

function sendErrorMail(arr) {

    var acc = AdsApp.currentAccount();
    var acc_name = acc.getName();
    var acc_id = acc.getCustomerId();

    var html = '<h1>Ungültige Zielseiten in ' + acc_name + ' [' + acc_id + ']</h1><p>Bei der Überprüfung des Accounts sind folgende Zielseiten als fehlerhaft erkannt worden:</p>';

    html += '<table><tr><td>URL</td><td>Response</td></tr>';

    arr.forEach(function(sub_arr) {
        html += '<tr><td>' + sub_arr[0] + '</td><td>' + sub_arr[1] + '</td></tr>';
    });

    html += '</table>';

    if(config.stripParameters) {
        html += '<p>Beachte, dass die Zieseiten ohne Parameter überprüft wurden - prüfe also zusätzlich, ob die Zielseiten auch mit Parametern nicht erreichbar sind.</p>';
    } else {
        html += '<p>Die URLs wurden als Ganzes (inklusive Parameter) gecrawled.</p>'
    }

    html += '<p>Liebe Grüße<br>Patrick</p>';

    MailApp.sendEmail(config.mail.recipient, 'URL Checker: ' + acc_name + ' [' + acc_id + ']', '', {
        htmlBody : html
    });
}

function getLength(arr) {
    arr.length;
}