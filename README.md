<h1 align="center">Welcome to Google Ads Link Checker 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href=" " target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/Digitalsterne-GmbH/google_ads_linkchecker/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="#" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/github/license/ PatrickSchababerle/Google Ads Link Checker" />
  </a>
</p>

> Simple script for validating final urls with Google Ads Scripts

## Usage

1. Login to your Google Ads account
2. Go to "Tools & Settings" > "Scripts"
3. Create a new script
4. Paste the following content into the script
5. Switch on the new scripts experience (Beta)

```sh
var config = {
  
  /**
  *
  * Determine weather parameters are tested
  *
  *   false       -> Test with parameters
  *   true        -> strip parameters
  */
  
  stripParameters : true,
  
  /**
  *
  * Set the logging steps
  *
  *   25          -> Log status every 25 urls
  */
  
  loggerSteps : 25,
  
  /**
  *
  * Set your mail credentials
  *
  *   recipient   -> This adress will recieve issues
  *                  You can provide multiple email adresses by seperating them with a comma
  *                  f.e. 'xx@company.com,yy.company.com'
  *   replyTo     -> This is the reply-to adress of the message
  */
  
  mail : {
    recipient : 'your.name@yourcompany.com',
    replyTo : 'noreply@yourcompany.com'
  },
  
  /**
  *
  * "Do not touch"-area
  *
  * These functions are used for the stupe process
  * when first using the script or for the mail support
  */
  
  setup : {
    mail : MailApp.getRemainingDailyQuota(),
    acc : {
      id : AdsApp.currentAccount().getCustomerId(),
      name : AdsApp.currentAccount().getName()
    }
  }
}

function main() {
  var script = UrlFetchApp.fetch('https://XXXX/dist/bundle.js').getContentText('utf-8');
  eval(script);
}
```

6. Afterwards add your details to the config object
7. Click "Save" and "Preview"
8. Authorize the script using your login credentials
9. Go back to "Scripts" and schedule the script once a day

That's it, your ads and extensions are now being testet once a day. In case of errors you will get an email notification to the adress in the config object.

## Author

👤 **Patrick Schababerle**

* Website: https://www.secret-share.com
* Github: [@ PatrickSchababerle](https://github.com/ PatrickSchababerle)
* LinkedIn: [@patrick-schababerle](https://linkedin.com/in/patrick-schababerle)

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
