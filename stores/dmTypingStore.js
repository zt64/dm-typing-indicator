/* eslint-disable object-property-newline */
const { Flux, FluxDispatcher, getModule } = require('powercord/webpack');
const { forceUpdateElement } = require('powercord/util');

const { getSetting } = powercord.api.settings._fluxProps('dm-typing-indicator');
// use an || {}, otherwise plugin will fail to construct and you won't be able to update it
const { tutorialContainer } = getModule([ 'homeIcon', 'downloadProgress' ], false) || (console.error('tutorialContainer not found in DM-Typing-Indicator!'), { tutorialContainer: 'CLASSNOTFOUND' });

const privateChannelStore = getModule([ 'getPrivateChannelIds' ], false);
const relationshipStore = getModule([ 'isBlocked', 'isFriend' ], false);
const channelStore = getModule([ 'hasChannel' ], false);
const userStore = getModule([ 'getCurrentUser', 'getUser' ], false);

const typingUsers = {};

function handleTypingStart ({ channelId, userId }) {
  const hasPrivateChannel = !!channelStore?.getMutablePrivateChannels()[channelId];
  const channelTypingUsers = Object.assign({}, typingUsers[channelId] || Object.freeze({}));

  const isCurrentUser = userId === userStore?.getCurrentUser().id;
  const isFriend = getSetting('ignoreNonFriend', true) ? relationshipStore?.isFriend(userId) : true;
  const isBlocked = getSetting('ignoreBlocked', true) ? relationshipStore?.isBlocked(userId) : false;

  if (hasPrivateChannel && !isCurrentUser && isFriend && !isBlocked) {
    channelTypingUsers[userId] = userStore?.getUser(userId);
    typingUsers[channelId] = channelTypingUsers;

    forceUpdateElement(`.${tutorialContainer}`);
  }
}

function handleTypingStop ({ channelId, userId }) {
  const hasPrivateChannel = !!channelStore?.getMutablePrivateChannels()[channelId];
  const channelTypingUsers = Object.assign({}, typingUsers[channelId]);

  if (hasPrivateChannel && channelTypingUsers !== null && channelTypingUsers[userId]) {
    delete channelTypingUsers[userId];

    if (Object.keys(channelTypingUsers).length > 0) {
      typingUsers[channelId] = channelTypingUsers;
    } else {
      delete typingUsers[channelId];
    }

    forceUpdateElement(`.${tutorialContainer}`);
  }
}

function handleMessageSent ({ channelId, message }) {
  const hasPrivateChannel = !!channelStore?.getMutablePrivateChannels()[channelId];

  if (hasPrivateChannel) {
    const userId = message.author.id;

    handleTypingStop({ channelId, userId });
  }
}

class PrivateChannelTypingStore extends Flux.Store {
  getFlattenedDMTypingUsers () {
    const privateChannels = privateChannelStore?.getPrivateChannelIds();

    return privateChannels.map(channelId => Object.values(typingUsers[channelId] || {})).flat();
  }

  getDMTypingUsers (channelId) {
    if (channelId) {
      return typingUsers[channelId] || {};
    }

    return typingUsers;
  }
}

module.exports = new PrivateChannelTypingStore(FluxDispatcher, {
  TYPING_START: handleTypingStart,
  TYPING_STOP: handleTypingStop,
  MESSAGE_CREATE: handleMessageSent
});
