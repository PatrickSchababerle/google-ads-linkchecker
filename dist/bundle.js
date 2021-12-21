/**
 * Result: Valid URLs
 **/
var valid = [];

/**
 * Result: Invalid URLs
 **/
var errors = [];

/**
 * Main Function Stack
 **/

var queue = {
    add : function(url, origin) {

        /**
         * Ensure parameter (url) is not null
         **/

        if(url != null) {

            /**
             * Strip Parameters if needed
             **/

            if(config.stripParameters) {
                url = url.split("?")[0];
            }

            /**
             * Add url to queue if not already contained
             **/

            if(this.content.indexOf(url) == -1) {
                this.content.push(url);
            }

            /**
             * Determine weather url already exists in index or not
             **/

            if(this.index[url] == undefined) {
                this.index[url] = [];
            }

            /**
             * Write to index
             **/

            if(this.index[url].indexOf(origin) == -1) {
                this.index[url].push(origin);
            }

            /**
             * Determine weather url already exists in counter or not
             **/

            if(this.counter[url] == undefined) {
                this.counter[url] = {};
            }

            if(this.counter[url][origin] == undefined) {
                this.counter[url][origin] = 1;
            }

            /**
             * Write to counter
             **/

            this.counter[url][origin]++;

        }
        return true;
    },
    process : function() {

        try {

            /**
             * Itterate through Queue
             **/

            this.content.forEach(function(url, index) {

                /**
                 * Log Status
                 **/

                queue.log(index);

                /**
                 * Fetch URL
                 **/

                var code = UrlFetchApp.fetch(url, {
                    muteHttpExceptions : true
                }).getResponseCode();

                /**
                 * Push Result
                 **/

                if(code < 200 || code >= 400) {
                    errors.push([url, code])
                } else {
                    valid.push([url, code])
                }

            });

        } catch(e) {
            return mailer.exeption(e.message);
        }

    },
    log : function(index) {

        /**
         * Log current processing progress in determined steps
         **/
        if(index == 0 || Number.isInteger((index + 1) / config.loggerSteps)) {
            Logger.log('   [' + (index + 1) + '/' + queue.content.length + '] ' + spacing((index + 1), queue.content.length, '') + 'Fetching ' + queue.content[index] + '...');
        }

        function spacing(index, max, offset) {
            var spacer = '';
            for(var i = 0; i < (max.toString().length - index.toString().length); i++) {
                spacer += ' ';
            }
            return spacer + offset;
        }
    },

    /**
     * Storage for unique urls to be processed
     **/

    content : [],

    /**
     * Index of urls and their origin
     **/

    index : {},

    /**
     * Count of the occurences
     **/

    counter : {}
}

var urls = {

    /**
     * Get only ad urls
     **/

    ads : {
        get : function() {
            var ads = AdsApp.ads()
                .withCondition("Status = ENABLED")
                .withCondition("CampaignStatus = ENABLED")
                .withCondition("AdGroupStatus = ENABLED")
                .get();
            while(ads.hasNext()) {
                var ad = ads.next();
                var origin = ad.getCampaign().getName() + ' > ' + ad.getAdGroup().getName();
                var adType = ad.getType();
                if(adType != "EXPANDED_DYNAMIC_SEARCH_AD" && adType != "UNKNOWN") {
                    var final_url = ad.urls().getFinalUrl();
                    queue.add(final_url, origin);
                }
            }
        }
    },

    /**
     * Get only extension urls
     **/

    ext : {
        get : function() {
            var ext = AdsApp.currentAccount().extensions()
                .sitelinks()
                .withCondition("Status = ENABLED")
                .get();
            while(ext.hasNext()) {
                var ex = ext.next();
                var final_url = ex.urls().getFinalUrl();
                if(final_url) {
                    queue.add(final_url, 'Extension');
                }
            }
        }
    },

    /**
     * Get all urls
     **/

    getAll : function() {
        this.ads.get();
        this.ext.get();
    }
}

var mailer = {

    /**
     * Static settings from global config
     **/

    settings : {
        recipient : config.mail.recipient,
        replyTo : config.mail.replyTo,
        account : config.setup.acc.name + ' [' + config.setup.acc.id + ']'
    },

    /**
     * Mail: Exeption Occured
     **/

    exeption : function(error) {
        var subj = 'Runtime error in ' + this.settings.account;
        var body = 'An error occured while testing your final urls in ' + this.settings.account + '. Please find all details attached:<br><br><code style="border-radius:5px;border:1px solid red;width:96%;padding:2%;color:red;font-weight:bold">' + error + '</code>';
        mailer.sender(subj, this.template.render('Runtime error', body, this.settings.account));
    },

    /**
     * Mail: Invalid URLs found
     **/

    invalid : function() {
        var subj = 'Invalid urls in ' + this.settings.account;
        var body = 'We found invalid urls while testing your final urls in ' + this.settings.account + '. Please find all details attached:<br><br>' + this.template.create.url_table(errors);
        mailer.sender(subj, this.template.render('Invalid urls', body, this.settings.account));
    },

    /**
     * Send HTML Mail
     **/

    sender : function(subject, body) {
        MailApp.sendEmail(mailer.settings.recipient, 'URL Checker: ' + subject, '', {
            htmlBody : body
        });
    },

    /**
     * Render HTML Mail Template (-Parts)
     **/

    template : {
        render : function(preheader, content, account) {
            return `<!doctype html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width"> <meta http-equiv="X-UA-Compatible" content="IE=edge"> <meta name="x-apple-disable-message-reformatting"> <title>${account}</title><!--[if gte mso 9]> <xml> <o:OfficeDocumentSettings> <o:AllowPNG/> <o:PixelsPerInch>96</o:PixelsPerInch> </o:OfficeDocumentSettings> </xml><![endif]--> </head> <body style="margin:0; padding:0; background:#eeeeee;"> <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;"> ${preheader}</div><div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;"> &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp; </div><center> <div style="width:100%; max-width:600px; background:#ffffff; padding:30px 20px; text-align:left; font-family: 'Arial', sans-serif;"><!--[if mso]> <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" bgcolor="#ffffff"> <tr> <td align="left" valign="top" style="font-family: 'Arial', sans-serif; padding:20px;"><![endif]--> <a href="https://ads.google.com"> <svg class="lockup-ads-logo _ngcontent-awn-AWSM-2" enable-background="new 0 0 192 192" height="32" viewBox="0 0 192 192" width="32" xmlns="http://www.w3.org/2000/svg"><g class="_ngcontent-awn-AWSM-2"><rect fill="none" height="192" width="192" class="_ngcontent-awn-AWSM-2"></rect><g class="_ngcontent-awn-AWSM-2"><rect fill="#FBBC04" height="58.67" transform="matrix(0.5 -0.866 0.866 0.5 -46.2127 103.666)" width="117.33" x="8" y="62.52" class="_ngcontent-awn-AWSM-2"></rect><path d="M180.07,127.99L121.4,26.38c-8.1-14.03-26.04-18.84-40.07-10.74c-14.03,8.1-18.84,26.04-10.74,40.07 l58.67,101.61c8.1,14.03,26.04,18.83,40.07,10.74C183.36,159.96,188.16,142.02,180.07,127.99z" fill="#4285F4" class="_ngcontent-awn-AWSM-2"></path><circle cx="37.34" cy="142.66" fill="#34A853" r="29.33" class="_ngcontent-awn-AWSM-2"></circle></g></g></svg></a> <h1 style="font-size:16px; line-height:22px; font-weight:normal; color:#333333;"> Dear User. </h1> <p style="font-size:16px; line-height:24px; color:#666666; margin-bottom:30px;"> ${content}</p><table width="100%" border="0" cellspacing="0" cellpadding="0"> <tr> <td> <table border="0" cellspacing="0" cellpadding="0"> <tr> <td bgcolor="#556270" style="padding: 12px 26px 12px 26px; border-radius:4px" align="center"> <a href="https://ads.google.com" target="_blank" style="font-family: 'Arial', sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; display: inline-block;"> Bring me to Google Ads </a> </td></tr></table> </td></tr><tr> <td width="100%" height="30">&nbsp;</td></tr></table> <hr style="border:none; height:1px; color:#dddddd; background:#dddddd; width:100%; margin-bottom:20px;"> <p style="font-size:12px; line-height:18px; color:#999999; margin-bottom:10px;"> &copy; Copyright <a href="https://www.secret-share.com" style="font-size:12px; line-height:18px; color:#666666; font-weight:bold;"> Patrick Schababerle</a>, All Rights Reserved. </p><!--[if mso | IE]> </td></tr></table><![endif]--> </div></center> </body> </html>`
        },
        create : {
            url_table : function(array) {
                var table = '<table style="width:100%"><tr style="font-weight:bold;margin-bottom:5px;"><td>URL</td><td>Response</td></tr>';
                array.forEach(function(sub_arr) {
                    table += '<tr><td>' + sub_arr[0] + '</td><td>' + sub_arr[1] + '</td></tr>';
                    table += '<tr><td colspan="2" style="color:grey;font-size:8pt;"><ul>';
                    queue.index[sub_arr[0]].forEach(function(origin) {
                        table += '<li>' + queue.counter[sub_arr[0]][origin] + ' x ' + origin + '</li>'
                    });
                    table += '</ul></td>';
                });
                table += '</table>';
                return table;
            }
        }
    }
}

/**
 * Main Process
 **/

/**
 * Gather all URLs
 **/

urls.getAll();

/**
 * Process Queue
 **/

queue.process();

if(errors.length) {
    mailer.invalid();
} else {
    Logger.log('   CHECK OF ' + valid.length + ' COMPLETED - No errors occured');
}