const { Flux, FluxDispatcher, getModule } = require('powercord/webpack');
const { forceUpdateElement } = require('powercord/util');

const { getSetting } = powercord.api.settings._fluxProps('dm-typing-indicator');

const relationshipStore = getModule([ 'isBlocked', 'isFriend' ], false);
const privateChannelStore = getModule([ 'getPrivateChannels' ], false);
const userStore = getModule([ 'getCurrentUser' ], false);

const typingUsers = {};

function handleTypingStart ({ channelId, userId }) {
  const hasPrivateChannel = !!privateChannelStore.getPrivateChannels()[channelId];
  const channelTypingUsers = Object.assign({}, typingUsers[channelId] || Object.freeze({}));

  const isCurrentUser = userId === userStore.getCurrentUser().id;
  const isFriend = getSetting('ignoreNonFriend', true) ? relationshipStore.isFriend(userId) : true;
  const isBlocked = getSetting('ignoreBlocked', true) ? relationshipStore.isBlocked(userId) : false;

  if (hasPrivateChannel && !isCurrentUser && isFriend && !isBlocked) {
    channelTypingUsers[userId] = userStore.getUser(userId);
    typingUsers[channelId] = channelTypingUsers;
  }
}

function handleTypingStop ({ channelId, userId }) {
  const hasPrivateChannel = !!privateChannelStore.getPrivateChannels()[channelId];
  const channelTypingUsers = Object.assign({}, typingUsers[channelId]);

  if (hasPrivateChannel && channelTypingUsers !== null && channelTypingUsers[userId]) {
    delete channelTypingUsers[userId];

    if (Object.keys(channelTypingUsers).length > 0) {
      typingUsers[channelId] = channelTypingUsers;
    } else {
      delete typingUsers[channelId];
    }

    forceUpdateElement(`.${getModule([ 'homeIcon', 'downloadProgress' ], false).tutorialContainer}`);
  }
}

class PrivateChannelTypingStore extends Flux.Store {
  getDMTypingUsers (channelId) {
    return (channelId
      ? typingUsers[channelId] || {}
      : Object.keys(privateChannelStore.getPrivateChannels()).map(channelId => Object.values(typingUsers[channelId] || {})).flat()
    );
  }
}

module.exports = new PrivateChannelTypingStore(FluxDispatcher, {
  TYPING_START: handleTypingStart,
  TYPING_STOP: handleTypingStop
});
