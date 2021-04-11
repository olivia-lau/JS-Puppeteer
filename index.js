const puppeteer = require('puppeteer');
const CREDS = require('./creds');

async function run() {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();

  await page.goto('https://github.com/login');
  // dom element selectors
  const USERNAME_SELECTOR = '#login_field';
  const PASSWORD_SELECTOR = '#password';
  const BUTTON_SELECTOR = '#login > div.auth-form-body.mt-3 > form > div > input.btn.btn-primary.btn-block';


  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(CREDS.username);

  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(CREDS.password);

  await page.click(BUTTON_SELECTOR);

//  await page.waitForNavigation();

  const userToSearch = 'sam';
  const searchUrl = `https://github.com/search?q=${userToSearch}&type=Users&utf8=%E2%9C%93`;

  await page.goto(searchUrl);
  await page.waitFor(1*2000);
  // browser.close();
  async function getNumPages(page) {
  const NUM_USER_SELECTOR = '#js-pjax-container > div > div.col-12.col-md-9.float-left.px-2.pt-3.pt-md-0.codesearch-results > div > div.d-flex.flex-column.flex-md-row.flex-justify-between.border-bottom.pb-3.position-relative > h3';

  let inner = await page.evaluate((sel) => {
    let html = document.querySelector(sel).innerHTML;

    // format is: "69,803 users"
    return html.replace(',', '').replace('users', '').trim();
  }, NUM_USER_SELECTOR);

  let numUsers = parseInt(inner);

  console.log('numUsers: ', numUsers);

  /*
  * GitHub shows 10 resuls per page, so
  */
  let numPages = Math.ceil(numUsers / 10);
  return numPages;
}
  const LIST_USERNAME_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.flex-auto > div:nth-child(1) > div.f4.text-normal > a';
  const LIST_EMAIL_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.flex-auto > div.d-flex.flex-wrap.text-small.color-text-secondary > div:nth-child(2) > a';
  const LENGTH_SELECTOR_CLASS = 'user-list-item';

  let listLength = await page.evaluate((sel) => {
    return document.getElementsByClassName(sel).length;
  }, LENGTH_SELECTOR_CLASS);

  let numPages = await getNumPages(page);


  console.log('Numpages: ', numPages);

  for (let h = 1; h <= numPages; h++) {

	   let pageUrl = searchUrl + '&p=' + h;

	    await page.goto(pageUrl);
      //await page.waitFor(2);

  	let listLength = await page.evaluate((sel) => {
  			return document.getElementsByClassName(sel).length;
  		}, LENGTH_SELECTOR_CLASS);

  	for (let i = 1; i <= listLength; i++) {
  		// change the index to the next child
  		let usernameSelector = LIST_USERNAME_SELECTOR.replace("INDEX", i);
  		let emailSelector = LIST_EMAIL_SELECTOR.replace("INDEX", i);

  		let username = await page.evaluate((sel) => {
  				return document.querySelector(sel).getAttribute('href').replace('/', '');
  			}, usernameSelector);

  		let email = await page.evaluate((sel) => {
  				let element = document.querySelector(sel);
  				return element? element.innerHTML: null;
  			}, emailSelector);

  		// not all users have emails visible
  		if (!email)
  			continue;

  		console.log('page ', h, ': ', username, ' -> ', email);

		// TODO save this users
	}
}


}

run();
