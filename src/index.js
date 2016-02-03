'use strict';

/**
 * @module src/index
 */

/**
 * Controls the app, imports other functionality
 *
 */
import {
  audioMuteControl,
  videoMuteControl,
  screenShare,
  sendFile } from './controllers/button-control';
import {
  peerJoined,
  peerLeft,
  peerUpdated,
  fileTransfer } from './controllers/peer-control';
import {
  sendMessage,
  addMessage,
} from './controllers/chat-control';
import isTalking from './controllers/audio-focus-control';
import whiteboard from './controllers/whiteboard-control';
import chooseRoom from './controllers/room-control';
import hark from 'hark';
export const Skynet = new window.Skylink();
export const userData = {
  id: '',
  audioMuted: false,
  videoMuted: false,
  screenShared: false,
};
(function App() {
  chooseRoom();
  // On load, initialize new Skylink connection
  Skynet.setDebugMode({ storeLogs: true });

  // Initialize UI controls
  audioMuteControl();
  videoMuteControl();
  screenShare();
  sendFile();

  // Initialize message controls
  addMessage();
  sendMessage();

  // Initialize peer controllers
  peerJoined();
  peerLeft();
  peerUpdated();
  fileTransfer();

  // Deal with self media
  // TODO: Init may need to be refactored to support different rooms, or at least re-called
  Skynet.on('mediaAccessSuccess', stream => {
    const vid = document.getElementById('myvideo');
    const selfSpeech = hark(stream, {});
    selfSpeech.on('speaking', () => isTalking(userData.id));
    window.attachMediaStream(vid, stream);
  });

 // Handle that oncoming stream, filter it into new vid elements (made by peer functions)
  Skynet.on('incomingStream', (peerId, stream, isSelf) => {
    if (isSelf) {
      userData.id = peerId;
      return;
    }
    const vid = document.getElementById(`${peerId}`);
    window.attachMediaStream(vid, stream);
  });

  Skynet.on('incomingMessage', (message, peerId, peerInfo, isSelf) => {
    let user = 'You';
    let className = 'you';
    if (!isSelf) {
      user = peerInfo.userData.displayName || 'Tacocat';
      className = 'message';
    }
    addMessage(`${user}: ${message.content}`, className);
  });

  Skynet.init({
    // Localhost testing key only for now
    apiKey: '44759962-822a-42db-9de2-39a31bf25675',
    // Yas
    defaultRoom: window.room,
  }, () => {
    Skynet.joinRoom({
      audio: true,
      video: true,
    });
  });
  whiteboard();
}());