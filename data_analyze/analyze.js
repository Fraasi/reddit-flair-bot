// const data = require('./data.js');
const nodeFetch = require('node-fetch');
const fs = require('fs');

nodeFetch('https://www.reddit.com/user/rSuomiFlairBot.json?limit=100')
    .then( result => result.json() )
    .then ( json => { 
        const texts = json.data.children;

        const percentageCount = [];
        const flairCount = {};
        
        const regexD = /^\d+/;
        const regexW = /[A-ZÄÖa-zäö\s-🇫🇮]+/;
        
        texts.forEach(el => {
            let splitted = el.data.selftext.split('\n');
            splitted.forEach(unit => {
                let num = Number(regexD.exec(unit));
                let flair = regexW.exec(unit);
                
                if(unit.includes('flaireja')) {
                    let diffFlairs = /\d{1,2},/.exec(unit); //;
                    let trimmed = diffFlairs[0].replace(',', '')
                    percentageCount.push(Number(trimmed))    
                }
        
                if (flair !== '' && flair !== ' ' &&flair !== '  ' && flair !== null && flair != false && num !== 0) { 
                    flair = flair[0].trim();
                    if (flairCount[flair]) flairCount[flair] += num;
                    else flairCount[flair] = num;
                }
            })
        })
        
        let eriFlairs = Object.keys(flairCount).length;
        let percent = percentageCount.reduce( (a,c) => {
            return a + c;
        })

        let usedIn = (percent / percentageCount.length).toFixed(1);
        let sorted = Object.entries(flairCount).sort( (a,b) => b[1] - a[1]);
            // .reduce( (a, c) => {
            //     a[c[0]] = c[1];
            //     return a;
            // }, {})
        let textString = `Tulokset laskettu botin ${texts.length}:sta viimesimmästä postauksesta ${(new Date()).toLocaleString('en-GB', {hour12:false})}\nEri flaireja yhteensä ${eriFlairs}\nFlairejä käytetty ${usedIn}% kaikista postauksista\n\n`;
        sorted.forEach( el => {
            textString += `${el[1]} ${el[0]}  \n`;
            
        })
            
        fs.writeFile('analyzed.txt', textString, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
        // console.log(textString);
    })
    
