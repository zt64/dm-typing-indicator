const { Plugin } = require('powercord/entities');
const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { forceUpdateElement } = require('powercord/util');
const { Spinner } = require('powercord/components');

const Typing = require('./components/Typing')
const Settings = require('./components/Settings')

module.exports = class DMTypingIndicator extends Plugin {
  constructor () {
    super();

    this.classes = {
      ...getModule([ 'guildSeparator', 'listItem' ], false),
      tutorialContainer: (getModule([ 'homeIcon', 'downloadProgress' ], false)).tutorialContainer
    };
  }

  startPlugin () {
    powercord.api.settings.registerSettings('dm-typing-indicator', {
      category: this.entityID,
      label: 'DM Typing Indicator',
      render: Settings
    });

    this.ConnectedTyping = this.settings.connectStore(Typing);

    this.loadStylesheet('style.css');
    this.injectPlugin();

    setInterval(() => forceUpdateElement(`.${this.classes.tutorialContainer}`), 1000)
  }

  injectPlugin() {
    const { DefaultHomeButton } = getModule([ 'DefaultHomeButton' ], false);

    inject('dm-typing', DefaultHomeButton.prototype, 'render', (args, res) => {
      const users = this.getTypingUsers();
      
      if (!users.length) return res;

      res.props.children = [ res.props.children ];
      res.props.children.push(React.createElement(this.ConnectedTyping, { users }));

      return res;
    });
  }

  // Creates an array of users that are typing in DMs at time of execution
  getTypingUsers() {
    const { getCurrentUser, getUser } = getModule([ 'getCurrentUser' ], false);
    const { getTypingUsers } = getModule([ 'getTypingUsers' ], false);

    const channels = getModule([ 'getPrivateChannels' ], false).getPrivateChannels();

    let users = [];

    for (const channelID in channels) {
      const typing = getTypingUsers(channelID);

      if (Object.keys(typing).length !== 0) {
        const userID = Object.keys(typing)[0];
        if (getCurrentUser().id !== userID) users.push(getUser(userID));
        // users.push(getUser(userID));
      }
    }

    return users;
  }

  pluginWillUnload () {
    uninject('dm-typing');
  }
};