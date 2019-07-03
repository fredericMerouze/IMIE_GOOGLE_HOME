'use strict';

const express = require('express')
const bodyParser = require('body-parser')

const { actionssdk } = require('actions-on-google');

const app = actionssdk({debug: true});

app.intent('actions.intent.MAIN', conv => {
    const ssml = '<speak>Hi! <break time="1"/> ' +
    'I can read out an ordinal like <say-as interpret-as="ordinal">123</say-as>. ' +
    'Say a number.</speak>'
    conv.ask(ssml);
});


app.intent('actions.intent.TEXT', handleTextIntent );

function handleTextIntent(conv, input){
    if(input === 'Allume la lampe'){
        response()
    } else {
        conv.ask('Pouvez-vous répéter');    
    }
}

function response(){
    return conv.ask('Comme si c\'était fait');
}

express().use(bodyParser.json(), app).listen(3000)