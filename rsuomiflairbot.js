function msToTime(duration) {
	// from https://stackoverflow.com/questions/19700283/how-to-convert-time-milliseconds-to-hours-min-sec-format-in-javascript
	var milliseconds = parseInt((duration%1000)/100)
		, seconds = parseInt((duration/1000)%60)
		, minutes = parseInt((duration/(1000*60))%60)
		, hours = parseInt((duration/(1000*60*60))%24);
	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;
	return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

function msUntillCodeRuns() {
	let now = new Date();
	let then = new Date(now);
	then.setHours(23, 0, 0, 0);	//when to run
	if (then - now <= 0) then.setDate(now.getDate() + 1);
	let msToRunTime = then - now;
	console.log(`${msToTime(msToRunTime)} to runtime.`);
	return msToRunTime;
}

function postFlairData() {
	
	const snoowrap = require('snoowrap');
	const nodeFetch = require('node-fetch');

	var environment = process.env.NODE_ENV || 'development';
	if (environment == "development") {
	  var redditConfig = require('./config.js');
	}

	const r = new snoowrap({
		userAgent: 'rSuomiFlairBot. Päivittäinen flairikatsaus.',
		clientId:  process.env.REDDIT_CLIENT || redditConfig.clientId,
		clientSecret:  process.env.REDDIT_SECRET || redditConfig.clientSecret,
		username:  process.env.REDDIT_USER || redditConfig.username,
		password: process.env.REDDIT_PASS || redditConfig.password
	});

	//build title
	let date = new Date();
	let minutes = date.getMinutes();
	let hours = date.getHours();
	let titleString = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()} Klo ${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;

	let textString = '';
	let flairCount = {}, flairLength, flairiest;

	nodeFetch('https://www.reddit.com/r/suomi.json?limit=100')
		.then( result => result.json() )
		.then ( json => {
			flairLength = json.data.children.length;
			json.data.children.forEach( (el, i, arr) => {
				if (!flairCount[el.data.link_flair_text]) {
					flairCount[el.data.link_flair_text] = 1;
				} else {
					flairCount[el.data.link_flair_text]++;
				}
			}) 
			return flairCount;
		})
		.then( fCount => {
			let noFlairCount = 0;
			let flairArr = [];
			
			for (var item in fCount) {
				if (item === 'null') noFlairCount = fCount[item];
				else flairArr.push([item, fCount[item]]);
			}
			
			flairArr.sort( (a, b) => b[1] - a[1] );
			flairArr.forEach( el => {
				textString += `${el[1]} ${el[0]}  \n`;
			})
			
			flairiest = flairArr[0][1] === flairArr[1][1] ?
				flairArr[1][1] === flairArr[2][1] ?
				`ei selkeetä voittajaa`
				: `suosituimmat flairit oli '${flairArr[0][0]}' sekä '${flairArr[1][0]}'`
				: `suosituin flairi oli '${flairArr[0][0]}'`;

			textString += `  
Eri flaireja yhteensä ${flairArr.length},  
ilman flairia ${noFlairCount} postausta ${flairLength}:sta.`;

			titleString = `${titleString} ${flairiest}.`;

			// r.getSubreddit('u_rSuomiFlairBot')
				// .submitSelfpost({title: titleString, text: textString})
				
			// r.getUser('rSuomiFlairBot').fetch().then( user => console.log(user))
			// for debuggin markdown syntax
			console.log(titleString);
			console.log(textString);
			setTimeout(postFlairData, msUntillCodeRuns());
		})
		.catch( (err) => {
			console.log('oh noes: ', err);
		})
}

setTimeout(postFlairData, msUntillCodeRuns());