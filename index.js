'use strict';

const express = require('express')
const bodyParser = require('body-parser')
const response = require('./response.json')

const { actionssdk } = require('actions-on-google');

const app = actionssdk({debug: true});

app.intent('actions.intent.MAIN', conv => {
    const startChoices = [{
        id : 1,
        jeu : 'plus ou moins'
    },
    {
        id : 2,
        jeu : 'jeu des lumières'        
    }]

    conv.ask('Bonjour ! Bienvenue sur Google home imie ! veuillez choisir votre jeu parmis la séléction suivante ! Le premier jeu est ' + startChoices[0].jeu + ' et le suivant est le ' + startChoices[1].jeu);
    conv.ask('voulez vous au ' + startChoices[0].jeu + ' ou au' + startChoices[1].jeu) 


    conv.data.valeur = getRandomIntInclusive(0,100)
    conv.data.count = 0
    conv.data.game = false;
    conv.data.introGame = true;
});

app.intent('actions.intent.TEXT', handleTextIntent );

function handleTextIntent(conv, input){
    if(input == 'plus ou moins' && !conv.data.game){
        conv.data.game = true
    } else{

    }

    if(conv.data.game === true){
        if(conv.data.introGame === true){
            conv.ask('Le jeu commence ! Veuillez choisir un nombre !')
            conv.data.introGame = false
        } else {
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
            conv.data.count += 1;
            conv.ask(response.victoire + conv.data.valeur + ' en ' + conv.data.count + ' coups !');             
        }
    } else {
        conv.ask('Je n\'ai pas compris !')
    }    
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1)) + min;
}

express().use(bodyParser.json(), app).listen(3000)