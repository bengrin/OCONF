'use strict';
import $ from 'jquery';
import { Skynet } from '../index';
import { userData } from '../index';
import { slideButton } from './chat-control';

import {
  audioMuteControl,
  videoMuteControl,
  screenShare,
  sendFile } from '../helpers/clickEvents';

/**
* Button control module.
* @module button-control
* @see button-control
*/
export function buttons() {
  /**
  * @function audioMuteControl
  */
  $('document').tooltip();
  $('#audio-mute').on('click', audioMuteControl);
  /**
  * @function videoMuteControl
  */
  $('#video-mute').on('click', videoMuteControl);

  $('#share-screen').on('click', screenShare);

  $('#send-file').on('click', sendFile);

  $('#slideButton').on('click', slideButton);
}
