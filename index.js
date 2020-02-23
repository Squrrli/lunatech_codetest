const express = require('express');
const fetch = require('node-fetch');
const request = require('request');

const app = express();

const airport_service_url = 'http://127.0.0.1:8080/airports?full=1';
const country_service_url = 'http://127.0.0.1:8080/countries';

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


function enrichAirportData(data) {
    console.log("enriching data...");

    /* Note: Data stored in first element of array -> List of airports in data[0]. */
    let counter = 0;
    for(let i = 0; i < data[0].length; i++) {
        let airport = data[0][i];
        if(airport['runways'].length > 0) counter++;
        // console.log(data[0][i]);
    }
    console.log("total: ", data[0].length);
    console.log("with runways: ", counter);
}

// ---- Routes ----
app.get('/', (req, res) => {
    res.send("Lunatech code test: Country - Airport API");
});

app.get('/countryairportsummary', (req, res) => {
    console.log("countryairportsummary endpoint hit");
    Promise.all([airportsPromise()])
        .then( (json) => {
            // console.log(json);
            enrichAirportData(json);
        })
        .catch( (err) => {
            console.error(err);
        });
});

app.listen(8445, () => console.log("Listening on port 8445..."));