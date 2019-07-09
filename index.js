'use strict';

const express = require('express')
const bodyParser = require('body-parser')
const response = require('./response.json')
const mysql = require('mysql')
const config = require('./db.js')
const moment = require('moment');

const {Permission,  actionssdk } = require('actions-on-google');

const app = actionssdk({debug: true});

const startChoices = [{
    id : 1,
    jeu : 'nombre magique'
},
{
    id : 2,
    jeu : 'jeu des lumières'        
}] 

app.intent('actions.intent.CANCEL', (conv) => {
    return conv.close('Aurevoir ' + conv.data.firstName);
});

app.intent('actions.intent.PERMISSION', (conv, input, granted) => {

    if (input === 'oui'){
    const explicit = conv.arguments.get('PERMISSION')
    conv.data.firstName = conv.user.name.given
    conv.data.lastName = conv.user.name.family
    //conv.data.firstName = 'fredo'
    //conv.data.lastName = 'Mercuro'
    conv.ask('Bonjour ! Bienvenue sur Google home imie ! veuillez choisir votre jeu parmis les choix suivants ! Le premier jeu est ' + startChoices[0]
    .jeu + ' et le suivant est le ' + startChoices[1].jeu);
    conv.ask('voulez vous jouer ' + startChoices[0]
    .jeu + ' ou au' + startChoices[1].jeu) 
    } else {
        return conv.close('Vous ne pouvez pas accéder à l\'application sans autoriser les accès ! Aurevoir !')
    }
    //CHECK THE GAME
    if(input === 'nombre magique' && conv.data.idGame === null){
        conv.data.idGame = 1
    } else if(input === 'jeu des lumières' && conv.data.idGame === null){
        conv.data.idGame = 1  
    } else {
        conv.ask('je n\'ai pas compris')
    }

  })


app.intent('actions.intent.MAIN', (conv, input) => {
    
    const options = {
        context: 'Cette application à besoin d\'accéder à vos informations !',
        permissions: ['NAME'],
    };
    
    conv.ask(new Permission(options)) 

    conv.data.valeur = getRandomIntInclusive(1,100)
    //conv.data.valeur = 50; 
    conv.data.count = 0
    conv.data.introGame = true;
    conv.data.idGame = null;
    conv.data.start = true
    conv.data.firstGame = true;
    conv.data.endGame = false;
    

});

app.intent('actions.intent.TEXT', handleTextIntent );

function handleTextIntent(conv, input){


    //CHECK THE GAME
    if(input === 'nombre magique' && conv.data.idGame === null){
        conv.data.idGame = 1
    } else if(input === 'jeu des lumières' && conv.data.idGame === null){
        conv.data.idGame = 1  
    }

    //CHECK ENDGAME
    if(conv.data.endGame === true){
        if(input === 'oui'){
             //INIT VALUES
            conv.data.count = 0;
            //conv.data.valeur = 60
            conv.data.valeur = getRandomIntInclusive(1,100)
            conv.data.endGame = false;
            conv.data.introGame = true
        } else if (input === 'non'){
            return conv.close('Aurevoir ' + conv.data.firstName);
        } else{
            conv.close('Désolé je n\'ai pas compris');  
        }
    }

    if(conv.data.idGame === 1 && conv.data.endGame === false){
        if(conv.data.introGame === true){
            conv.ask('J\'ai choisis un nombre entre 1 et 100 ! A vous de le devinez !')
            conv.data.introGame = false
            conv.data.startDate = new moment();
        } else if (conv.data.introGame === false){
            startGameMoreOrLess(conv, input)
        }
    }
}


function startGameMoreOrLess(conv, input){
    if(Number.parseInt(input)){
        if(parseInt(input) > conv.data.valeur){
            conv.data.count += 1;
            conv.ask(response.negatif);
        } else if (parseInt(input) < conv.data.valeur){
            conv.data.count += 1;
            conv.ask(response.positif);    
        } else {
            conv.data.count += 1
            conv.data.endDate = new moment(); 
            conv.data.time = parseInt((conv.data.endDate.diff(conv.data.startDate))/1000)

            conv.ask(response.victoire + conv.data.valeur + ' en ' + conv.data.count + ' coups ! Voulez-vous rejouer ?')
            //GET DATE
            conv.data.date = moment().format('YYYY-MM-DD HH:mm:ss');
            //SEND DATA
            let user = "SELECT count(ID_utilisateur) FROM dim_utilisateur WHERE nom = '"+ conv.data.lastName +"' AND prenom = '"+conv.data.firstName+"' ";
    
            connection.query(user, function(err, result){
                if (err) throw err
                conv.data.user = result[0]['count(ID_utilisateur)'];
                //console.log(result[0]['count(ID_utilisateur)'])

                if(conv.data.user === 1){
                    //EXECUTE QUERY  
                    let insertDimTemps = "INSERT INTO dim_temps (timestamp) VALUES ('"+conv.data.date+"')";
                    connection.query(insertDimTemps, function(err){
                        if (err) throw err                    
                    }); 
    
                    //SELECT DIM_TEMPS ID, DIM_USER ID, DIM_JEU ID
                    let IDTemps = "SELECT ID_temps FROM dim_temps WHERE timestamp = '"+ conv.data.date +"' ";
                    let IDUser = "SELECT ID_utilisateur FROM dim_utilisateur WHERE nom = '"+ conv.data.lastName +"' AND prenom = '"+conv.data.firstName+"' ";
                    let IDGame = "SELECT ID_jeu FROM dim_jeu WHERE libelle_jeu = 'nombre_magique' ";

                    mysqlselect(connection, IDTemps, IDUser, IDGame).then((result) => {
                        //EXECUTE QUERY
                        console.log(result)
                        let insertFactPartie = "INSERT INTO fact_partie( ID_jeu, ID_temps, ID_utilisateur, score, temps_partie, fini) VALUES ('"+result[2][0]['ID_jeu']+"','"+result[0][0]['ID_temps']+"','"+result[1][0]['ID_utilisateur']+"','"+conv.data.count+"','"+conv.data.time+"',1)";
                        connection.query(insertFactPartie, function(err, result){
                            if (err) throw err
                            console.log(result)
                        });                             
                    })    
                } else {
                    //EXECUTE QUERY  
                    let insertUser = "INSERT INTO dim_utilisateur (nom, prenom, stade_maladie) VALUES ('"+conv.data.lastName+"', '"+conv.data.firstName+"', 0)"; 
                    connection.query(insertUser);             
                }                 
            })
            //ENDGAME
            conv.data.endGame = true;
            conv.data.startDate = null;
            conv.data.endDate = null;
        }
    } else {
        conv.ask('Je n\'ai pas compris !')
    }    
}

//FUNCTIONS
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1)) + min;
}

function mysqlselect(connection, IDTemps, IDUser, IDGame) {
    return new Promise((resolve, reject) => {
        let sql = IDTemps+";"+IDUser+";"+IDGame;
        connection.query(sql, function (err, result) {
            if (err) reject(err);
            let res = result;
            resolve(res);
        });
    });
};

express().use(bodyParser.json(), app).listen(3000)