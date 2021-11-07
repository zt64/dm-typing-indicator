/* eslint-disable object-property-newline */
const { Flux, FluxDispatcher, getModule } = require('powercord/webpack');

const { getSetting } = powercord.api.settings._fluxProps('dm-typing-indicator');

const privateChannelStore = getModule([ 'getPrivateChannelIds' ], false);
const relationshipStore = getModule([ 'isBlocked', 'isFriend' ], false);
const channelStore = getModule([ 'hasChannel' ], false);
const userStore = getModule([ 'getUser', 'getCurrentUser' ], false);

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

    FluxDispatcher.dirtyDispatch({ type: 'DMTI_REFRESH_HOME' });
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

    FluxDispatcher.dirtyDispatch({ type: 'DMTI_REFRESH_HOME' });
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
