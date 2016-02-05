import $ from 'jquery';
import { addMessage } from '../controllers/chat-control';
import { userData } from '../index';

/**
* @function peerJoined
*/
export function peerJoined(peerId, peerInfo, isSelf) {
  const user = isSelf ? 'You' : peerInfo.userData.displayName;
  addMessage(user + ' joined the room', 'action');
  if (isSelf) return;
  userData.peerJoining = true;
  const displayName = peerInfo.userData.displayName !== undefined ? peerInfo.userData.displayName : 'anon';
  const div = $('<div />', {
    id: `video${peerId}`,
    class: 'videodiv',
  });
  const video = $('<video />', {
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
    const user = peerInfo.userData.displayName || peerId;
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
    const div = $('#speaker');
    if (videoStatus) div.addClass('unicorn-self');
    else div.removeClass('unicorn-self');
  } else if (isSelf) {
    const div = $('#self');
    if (videoStatus) div.addClass('unicorn');
    else div.removeClass('unicorn');
  } else {
    const div = $(`#video${peerId}`);
    if (videoStatus) div.addClass('unicorn');
    else div.removeClass('unicorn');
  }
}
