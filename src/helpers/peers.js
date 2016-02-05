'use strict';
import $ from 'jquery';
import { addFile, addMessage } from '../controllers/button-control'
import { Skynet } from '../index';
import { userData } from '../index';

/**
* @function peerJoined
*/
export function peerJoined(peerId, peerInfo, isSelf) {
    if (isSelf) return;
    var user = 'You';
    user = peerInfo.userData.displayName || peerId;
    addMessage(user + ' joined the room', 'action');
    userData.peerJoining = true;
    let displayName = peerInfo.userData.displayName !== undefined ? peerInfo.userData.displayName : 'anon';
    let div = $('<div></div>')
      .addClass('videodiv')
      .attr('id', `video${peerId}`);
    let video = $('<video />', {
        id: peerId,
        autoplay: true,
        class: 'videocontainer peervideo',
        'data-display-name': displayName,
    });
    div.append(video);
    $('#video-list').append(div);
}

/**
* @function peerLeft
*/
export function peerLeft(peerId, peerInfo, isSelf) {
  if (isSelf) return;
  // this should remove the peer, 
  else if ($(`#video${peerId}`)) {
    // handling if peer is the speaker, this will ensure speaker is removed
    user = peerInfo.userData.displayName || peerId;
    addMessage(user + ' left the room', 'action');
    $(`#${peerId}`).remove();
    $(`#video${peerId}`).remove();
  }
}

/**
* @function peerUpdated
*/
export function peerUpdated (peerId, peerInfo, isSelf) {
  const videoStatus = peerInfo.mediaStatus.videoMuted;
  const speaker = !isSelf ? $(`#${peerId}`).parent()[0] : $('#myvideo').parent()[0];
  if (speaker.id === 'speaker') {
    let div = $('#speaker');
    if (videoStatus) div.addClass('unicorn-self');
    else div.removeClass('unicorn-self');
  } else if (isSelf) {
    let div = $('#self');
    if (videoStatus) div.addClass('unicorn');
    else div.removeClass('unicorn');
  } else {
    let div = $(`#video${peerId}`);
    if (videoStatus) div.addClass('unicorn');
    else div.removeClass('unicorn');
  }
}

export function fileTransfer () {
  Skynet.on('dataTransferState', function(state, transferId, peerId, transferInfo, error) {
  let displayName = Skynet.getPeerInfo(peerId).userData;
  let transferStatus = $('#' + peerId + '_' + transferId)[0];

  switch (state) {
    case Skynet.DATA_TRANSFER_STATE.UPLOAD_REQUEST:
      let result = confirm('Incoming transfer request!\n\nFile: ' + transferInfo.name +
        '\n\nAccept?');
      Skynet.acceptDataTransfer(peerId, transferId, result);
      break;
    case Skynet.DATA_TRANSFER_STATE.UPLOAD_STARTED:
      addMessage('You\'ve sent a file: ' + transferInfo.name);
      break;
    case Skynet.DATA_TRANSFER_STATE.DOWNLOAD_STARTED:
      addFile(transferId, peerId, displayName, transferInfo, false);
      break;
    case Skynet.DATA_TRANSFER_STATE.UPLOADING:
      if (transferStatus) {
        transferStatus.innerHTML = (transferInfo.percentage);
        transferStatus.innerHTML += '%';
      } else {
        addFile(transferId, peerId, displayName, transferInfo, true);
      }
      break;
    case Skynet.DATA_TRANSFER_STATE.DOWNLOADING:
      transferStatus.innerHTML = (transferInfo.percentage);
      transferStatus.innerHTML += '%';
      break;
    case Skynet.DATA_TRANSFER_STATE.DOWNLOAD_COMPLETED:
      transferStatus.innerHTML = 'Completed';
      transferStatus = $('#' + transferId)[0];
      transferStatus.href = URL.createObjectURL(transferInfo.data);
      transferStatus.style.display = 'block';
      break;
    case Skynet.DATA_TRANSFER_STATE.UPLOAD_COMPLETED:
      transferStatus.innerHTML = 'Completed';
      break;
    case Skynet.DATA_TRANSFER_STATE.REJECTED:
      alert(displayName + ' has rejected your request.\n\nFile: ' + transferInfo.name +
        '\n\nSize: ' + transferInfo.size);
      break;
    case Skynet.DATA_TRANSFER_STATE.ERROR:
      addMessage(transferId + ' failed. Reason: \n' +
        error.message);
      transferStatus.innerHTML = 'Failed';
      break;
    case Skynet.DATA_TRANSFER_STATE.CANCEL:
      addMessage(transferId + ' canceled. Reason: \n' +
        error.message);
      transferStatus.innerHTML = 'Canceled';
    }
  });
}
