const socket = io('/')
const videoGrid = document.getElementById('video-grid')
// const videoRecordButton = document.getElementById('recordVideo')
const stopVideoRecord = document.getElementById('stopVideo')
const playButton = document.getElementById('play')
const recordedVideo = document.querySelector('video#recorded');
// const myPeer = new Peer(undefined, {
//   path: '/peerjs',
//   host: '/',
//   port: '443'
// })
var  chunks=[] ;
const myPeer = new Peer(undefined, {
  host: 'peerjs-server.herokuapp.com',
  secure: true,
  port: 443,
  config: {'iceServers': [
    { url: 'stun:stun.l.google.com:19302' },
    {
      urls: "stun:openrelay.metered.ca:80"
    },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject"
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
    

  ]} /* Sample servers, please use appropriate ones */
})
var mediaRecorder;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  
  //  videoRecordButton.onclick = function() {
  //   mediaRecorder.start();
    
  //   console.log("mediaRecorder.state-------------",mediaRecorder.state);
  //   console.log("recorder started");
  //   // videoRecordButton.style.background = "red";
  //   // videoRecordButton.style.color = "black";
  
  //   stopVideoRecord.onclick = function() {
  //     console.log('clicked stop button ------------',mediaRecorder.state);
  //    mediaRecorder.stop();
  //     console.log(mediaRecorder.state);
  //     console.log("recorder stopped");
     
  //     // downloadButton.disabled = false;
  //   }
  //   mediaRecorder.onstop = function(e) {
  //     console.log("data available after MediaRecorder.stop() called.");
  // // mediaRecorder.stop();;
  
    
  
  //   }
  //   mediaRecorder.ondataavailable = e => chunks.push(e.data);
  //   console.log(chunks ,' clciked chunks')
  // }
  playButton.addEventListener('click', () => {
    console.log(chunks)
      const superBuffer = new Blob(chunks, {type: 'video/webm'});
      recordedVideo.src = null;
      recordedVideo.srcObject = null;
      recordedVideo.src = window.URL.createObjectURL(superBuffer);
      recordedVideo.controls = true;
      recordedVideo.play();
    });
  // console.log('mediaRecorder==',mediaRecorder.state)
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      // console.log('peer on call ==',mediaRecorder.state)
      addVideoStream(video, userVideoStream)
      

      
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
  // input value
  let text = $("input");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('')
    }
  });
  socket.on("createMessage", message => {
    $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
    scrollToBottom()
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')

  call.on('stream', userVideoStream => {
   
    addVideoStream(video, userVideoStream)
    mediaRecorder = new MediaRecorder(userVideoStream);
    mediaRecorder.start();
    
    //videoRecordButton.onclick = function() {
     
      
     
      console.log("recorder started");
      // videoRecordButton.style.background = "red";
      // videoRecordButton.style.color = "black";
    
      stopVideoRecord.onclick = function() {
    
       mediaRecorder.stop();
        console.log(mediaRecorder.state);
        console.log("recorder stopped");

        //upload video file 

        
        
        



       
        // downloadButton.disabled = false;
      }
      mediaRecorder.onstop = function(e) {
        console.log("data available after MediaRecorder.stop() called.");

        // var newVideoEl = document.createElement('video')
        // newVideoEl.height = '400'
        // newVideoEl.width = '600'
        // newVideoEl.autoplay = true
        // newVideoEl.controls = true
        // newVideoEl.innerHTML = `<source src="${window.URL.createObjectURL(new Blob(chunks))}"
        //  type="video/mp4">`
        // // document.body.removeChild(videoElem)
        // // document.body.insertBefore(newVideoEl, 
        //   // );

        // var formdata = new FormData();
        // formdata.append('blobFile', new Blob(chunks));


        // fetch('/uploader.php', { 
        //     method: 'POST',
        //     body: formdata
        // }).then(()=>{
        //     alert('streamed video file uploaded')
        // })
    // mediaRecorder.stop();;
    
      
    
      }
     
   // }
    // mediaRecorder.ondataavailable = e => chunks.push(e.data);
    // console.log(chunks ,' clciked chunks')
    mediaRecorder.ondataavailable = function(ev) {
      chunks.push(ev.data);
      console.log(chunks ,' ----ondataavailable licked mediarecorder--')
  }

  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  
  videoGrid.append(video)

  // mediaRecorder.ondataavailable = e => chunks.push(e.data);
}



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled; 
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}
