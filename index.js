const express = require('express');
const fetch = require('node-fetch');
const request = require('request');

const app = express();

// Services running in seperate Docker containers to allow both be accessed at their specified port: 8080
const airport_service_url = 'http://127.0.0.1:8001/airports?full=1';
const country_service_url = 'http://127.0.0.1:8002/countries';

const countriesPromise = () => 
{ return new Promise( (resolve, reject) => {
    fetch(country_service_url)
        .then( (res) => res.json() )
        .then( (json) => resolve(json) )
        .catch( (err) => {
            console.log("Error while retreiving countries: ", err);
            reject(err);
        })
    });
}

const airportsPromise = () => 
{ return new Promise( (resolve, reject) => {
    fetch(airport_service_url)
        .then( (res) => res.json() )
        .then( (json) => resolve(json) )
        .catch( (err) => {
            console.log("Error while retreiving airports: ", err);
            reject(err);
        })
    });
}


/* Enrich data received from the Airport and Countries services.
 * data: Array, data[0] == countries array, data[1] == airports list.
 * For each airport, if airport has runways, push onto list in corrosponding country obj
*/
function enrichData(data) {
    console.log("enriching data...");
    let countries = data[0];
    let airports = data[1];
    const countryDictonary = createDictionary(countries);

    // TODO: save each country data as key value pairs: "code" : {  ... ,
    //                                                              "code": String,
    //                                                              ...
    //                                                            }
    // initial process removes need to iterate on each airport, O(n^2) => O(n)

    for(let i=0; i < countries.length; i++) {
        let country = countries[i];
        country.airports = [];
        for(let j = 0; j < 50; j++) {
            let airport = airports[j]
            if(airport['runways'].length > 0 && airport['iso_country'] === country['code']) {
                // add airport to country data
                country.airports.push(airport);
            }
        }    
    }
    return countries;
}

/* Create a dictionary from country data to avoid having to loop each time to find country */
function createDictionary(data) {
    let dict = {};
    for(let i = 0; i < data.length; i++) {
        let key = data[i]['code'];
        dict[key] = i;
    }
    console.log(dict);
}

// ---- Routes ----

// TODO: reroute to /countryairportsummary endpoint
app.get('/', (req, res) => {
    res.send("Lunatech code test: Country - Airport API");
    countriesPromise()
        .then( json => {
            countryData = json;
        }).catch( err => console.error(err) );
});

app.get('/countryairportsummary', (req, res) => {
    console.log("countryairportsummary endpoint hit");
    Promise.all([countriesPromise(), airportsPromise()])
        .then( json => {
            // console.log(json);
            res.json(enrichData(json));
        })
        .catch( (err) => {
            console.error(err);
        });
});

app.listen(8445, () => console.log("Listening on port 8445..."));