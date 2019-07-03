'use strict';

const express = require('express')
const bodyParser = require('body-parser')

const { actionssdk } = require('actions-on-google');

const app = actionssdk({debug: true});

app.intent('actions.intent.MAIN', conv => {
    conv.data.valeur = 70
    const ssml = '<speak>Bonjour! <break time="1"/> ' +
    'I can read out an ordinal like <say-as interpret-as="ordinal">123</say-as>. ' +
    'Say a number.</speak>'
    conv.ask(ssml);
});



app.intent('actions.intent.TEXT', handleTextIntent );

function handleTextIntent(conv, input){
        if(parseInt(input) > conv.data.valeur){
            conv.ask('c\'est moins');
        } else if (parseInt(input) < conv.data.valeur){
            conv.ask('c\'est plus');    
        } else {
            conv.ask('Bravo le nombre de départ est ' + conv.data.valeur);             
        }

}

express().use(bodyParser.json(), app).listen(3000)