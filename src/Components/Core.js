import React, { useState, useEffect } from "react";
import MicIcon from '@material-ui/icons/Mic';
import logo from './Components/logo.svg';
import './Core.css';
import $ from 'jquery';
import Init from './CoreInit.js';
import Instruction from './Instruction.js';
import Clock from './Clock.js';

//------------------------SPEECH RECOGNITION-----------------------------

const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continous = true
recognition.interimResults = true
recognition.lang = 'en-US'


//------------------------COMPONENT-----------------------------

const Speech = () => {
  const [{listening, showlistening,
    microphone, bgcolor}, setState] = useState(Init);

  useEffect (() => {
    // fetch('http://127.0.0.1:8000/api/language')
    // .then(res => res.json())
    // .then(
    //   (result) => {
    //     console.log(result[0]['content']);
    //   }
    // );
  }, [])
  
  const toggleListen = () => {
    setState(state => ({ ...state, listening: !listening}));
    console.log(listening);
    handleListen();
  }

  const handleListen = () => {
    console.log('listening?', listening)
    if (listening) {
      recognition.start()
      recognition.onend = () => {
        console.log("...continue listening...")
        recognition.start()
      }

    } else {
      recognition.stop()
      recognition.onend = () => {
        setState(state => ({ ...state, microphone: 'red'}));
        console.log("Stopped listening per click")
      }
    }

    recognition.onstart = () => {
      console.log("Listening!")
      setState(state => ({ ...state, bgcolor: '#282c34', microphone:"green"}));
    }

    let intermiTranscript = ''
    recognition.onresult = event => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) intermiTranscript += transcript + ' ';
        else finalTranscript += transcript;
      }
      if (finalTranscript === "打開電源"){
        console.log("指令成功！")
        setState(state => ({ ...state, bgcolor:'#006400', showlistening:"Power On"}));
        $.ajax({
          url:"https://maker.ifttt.com/trigger/ricecookeron/with/key/dyMeTmyKz4_uQNNPyqZABx",
          dataType: 'JSONP',
          jsonpCallback: 'callback',
          data: {"value1":"rice cooker on"},
          success:function(result){alert(result)}
        })
      }
      else if(finalTranscript === "關掉電源"){
        console.log("指令成功！")
        setState(state => ({ ...state, bgcolor:'#006400', showlistening:"Power Off"}));
        $.ajax({
          url:"https://maker.ifttt.com/trigger/ricecookeroff/with/key/dyMeTmyKz4_uQNNPyqZABx",
          dataType: 'JSONP',
          jsonpCallback: 'callback',
          data: {"value1":"rice cooker off"},
          success:function(result){alert(result)}
        })
      }
      document.getElementById('final').innerHTML = finalTranscript

      //-------------------------COMMANDS------------------------------------

      const transcriptArr = finalTranscript.split(' ')
      const stopCmd = transcriptArr.slice(-3, -1)
      console.log('stopCmd', stopCmd)

      if (stopCmd[0] === 'stop' && stopCmd[1] === 'listening'){
        recognition.stop()
        recognition.onend = () => {
          console.log('Stopped listening per command')
          const finalText = transcriptArr.slice(0, -3).join(' ')
          document.getElementById('final').innerHTML = finalText
        }
      }
    }

    //-----------------------------------------------------------------------

    recognition.onerror = event => {
      console.log("Error occurred in recognition: " + event.error)
    }

  }


    return (
        <div>
          <header className="App-header" style={{backgroundColor: bgcolor}}>
            <div id='listening' className='listening' style={{position: "absolute", top: 10, left: 10}}>{showlistening}</div>
            <button id='microphone-btn' className="button" onClick={toggleListen}>
              <img src={logo} className="App-logo" alt="logo"/>
            </button>
            <div className='memo'>
              <Instruction></Instruction>
            </div>
            <div className = 'clock'>
              <Clock></Clock>
            </div>
            <div id='final' className="final"></div>
          </header>
          <MicIcon fontSize="large" style={{position:"absolute", color:microphone, top:10, right:10}}/>
        </div>
    )
}

export default Speech



