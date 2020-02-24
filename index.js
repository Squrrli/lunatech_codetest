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

    for(let i=0; i < airports.length; i++) {
        let airport = airports[i]
        if(airport['runways'].length > 0) {
            // add airport to country data
            let country = countries[countryDictonary[airport.iso_country]]; // Get country corrosponding with iso_country value in airport
            country.airports = [];
            country.airports.push(airport);            
        }
    }
    console.log("finished enriching data.");    
    return countries;
}

/* Create a dictionary from country data to avoid having to loop each time to find country */
function createDictionary(data) {
    console.log("creating country dict...");
    let dict = {};
    for(let i = 0; i < data.length; i++) {
        let key = data[i]['code'];
        dict[key] = i;
    }
    return dict;
}

// ---- Routes ----

// TODO: reroute to /countryairportsummary endpoint
app.get('/', (req, res) => {
    res.send("Lunatech code test: Country - Airport API");
    countriesPromise()
        .then( json => {
            countryData = json;
        }).catch( err =>  {
            console.error(err);
            res.status(500).send("Internal Server error 500");   
        });
});

app.get('/countryairportsummary', (req, res) => {
    console.log("/countryairportsummary endpoint hit");
    Promise.all([countriesPromise(), airportsPromise()])
        .then( json => {
            res.json(enrichData(json));
        })
        .catch( (err) => {
            console.error(err);
            res.status(500).send("Internal Server error 500");
        });
});

app.listen(8445, () => console.log("Listening on port 8445..."));