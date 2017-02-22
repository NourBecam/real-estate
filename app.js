//importing modules
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

//creating a new express server
var app = express();

//setting EJS as the templating engine
app.set('view engine', 'ejs');

//setting the 'assets' directory as our static assets dir (css, js, img, etc...)
app.use('/assets', express.static('assets'));

var PrixEstimation = {
    LeTitre: "PrixEstimation du bien",
    PrixMoyen: 0,
    Finale: "",
}
var Données = {
    Prix: 0,
    Ville: 0,
    Type: 0,
    Superficie: 0,
}
var M = {
    PrixMoyenLBC: 0,
}

app.get('/', function (req, res) {
    if (req.query.lienLBC) {
        request(req.query.lienLBC, function (error, response, body) {

            if (!error && response.statusCode == 200) {
                const $ = cheerio.load(body)
                const DonnéesArray = $('section.properties span.value')
                Données = {
                    Ville: $(DonnéesArray.get(1)).text().trim().toLowerCase().replace(/\_|\s/g, '-'),
                    Prix: parseInt($(DonnéesArray.get(0)).text().replace(/\s/g, ''), 10),
                    Type: $(DonnéesArray.get(2)).text().trim().toLowerCase(),
                    Superficie: parseInt($(DonnéesArray.get(4)).text().replace(/\s/g, ''), 10)
                }
                M.PrixMoyenLBC = Données.Prix / Données.Superficie

            }
            else { console.log(error) }
        }
        )
    }

    var url = 'https://www.meilleursagents.com/Prix-immobilier/' + Données.Ville.toLowerCase

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(body);
            var PrixMoyen = "";
            var a = $(this)
            if (Type == "Appartement") { // S'il s'agit d'un appartement
                if (a.children()[0].next.data == "Prix m² appartement") {
                    PrixMoyen = a.next().next().text();
                    PrixMoyen = PrixMoyen.substring(14, 19);
                    PrixMoyen = PrixMoyen.split(" ");
                    PrixEstimation.PrixMoyen = PrixMoyen[0] + PrixMoyen[1];
                }
            }
            if (Type == "Maison") { // S'il s'agit d'une maison
                if (a.children()[0].next.data == "Prix m² maison") {
                    PrixMoyen = a.next().next().text();
                    PrixMoyen = PrixMoyen.substring(14, 19);
                    PrixMoyen = PrixMoyen.split(" ");
                    PrixEstimation.PrixMoyen = PrixMoyen[0] + PrixMoyen[1];
                }
            }
        }
    })


    if (PrixEstimation.PrixMoyen == M.PrixMoyenLBC) {
        PrixEstimation.Finale = "Le Prix est abordable";
    }
    else if 
        (PrixEstimation.PrixMoyen < M.PrixMoyenLBC) {
            PrixEstimation.Finale = "Le prix est trop élevé";
    }
    else {
        PrixEstimation.Finale = "Prix trop bas, attention !";
    }
    //}*/
    res.render('home', {

        Message1: Données.Prix,
        Message2: Données.Superficie,
        Message3: Données.Ville,
        Message4: Données.Type,
        Message5: M.PrixMoyenLBC,
        Message6: PrixEstimation.PrixMoyen,
        Message7: PrixEstimation.Finale,
    });
});








app.listen(3000, function () {
    console.log('App listening on port 3000!');
});