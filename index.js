'use strict';

const express = require('express')
const bodyParser = require('body-parser')
const response = require('./response.json')

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


app.intent('actions.intent.PERMISSION', (conv, input, granted) => {

    if (input === 'oui'){
    const explicit = conv.arguments.get('PERMISSION')
    conv.data.firstName = conv.user.name.given
    conv.data.lastName = conv.user.name.family
    conv.ask('Bonjour ! Bienvenue sur Google home imie ! veuillez choisir votre jeu parmis la séléction suivante ! Le premier jeu est ' + startChoices[0]
    .jeu + ' et le suivant est le ' + startChoices[1].jeu);
    conv.ask('voulez vous au ' + startChoices[0]
    .jeu + ' ou au' + startChoices[1].jeu) 
    }

    //CHECK THE GAME
    if(input === 'nombre magique' && conv.data.idGame === null){
        conv.data.idGame = 1
    } else if(input === 'jeu des lumières' && conv.data.idGame === null){
        conv.data.idGame = 1  
    }

  })


app.intent('actions.intent.MAIN', (conv, input) => {
    
    const options = {
        context: 'To address you by name and know your location',
        permissions: ['NAME'],
    };
    
    conv.ask(new Permission(options)) 

    //conv.data.valeur = getRandomIntInclusive(0,100)
    conv.data.valeur = 50; 

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
            conv.data.valeur = 60
            conv.data.endGame = false;
            conv.data.introGame = true
        } else if (input === 'non'){
            return conv.close('Aurevoir ' + conv.data.firstName);
        }
    }

    if(conv.data.idGame === 1 && conv.data.endGame === false){
        if(conv.data.introGame === true){
            conv.ask('Le jeu commence ! Veuillez choisir un nombre !')
            conv.data.introGame = false
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
            conv.ask(response.victoire + conv.data.valeur + ' en ' + conv.data.count + ' coups ! Voulez-vous rejouer ?')

            //ENDGAME
            conv.data.endGame = true;
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