/* eslint-disable curly, object-property-newline */
const { Plugin } = require('powercord/entities');
const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree, forceUpdateElement } = require('powercord/util');

const dmTypingStore = require('./stores/dmTypingStore');

const Settings = require('./components/Settings');
const TypingIndicator = require('./components/TypingIndicator');
const i18n = require('./i18n');

module.exports = class DMTypingIndicator extends Plugin {
  constructor () {
    super();

    this.classes = {
      tutorialContainer: getModule([ 'homeIcon', 'downloadProgress' ], false).tutorialContainer,
      listItem: getModule([ 'guildSeparator', 'listItem' ], false).listItem
    };
  }

  get dmTypingStore () {
    return dmTypingStore;
  }

  async startPlugin () {
    powercord.api.settings.registerSettings('dm-typing-indicator', {
      category: this.entityID,
      label: 'DM Typing Indicator',
      render: Settings
    });

    powercord.api.i18n.loadAllStrings(i18n);

    this.loadStylesheet('./style.css');
    this.injectTypingIndicator();
  }

  injectTypingIndicator () {
    const { DefaultHomeButton } = getModule([ 'DefaultHomeButton' ], false);
    const ConnectedTypingIndicator = this.settings.connectStore(TypingIndicator);

    inject('dm-typing-indicator', DefaultHomeButton.prototype, 'render', (_, res) => {
      if (!Array.isArray(res)) res = [ res ];

      const badgeContainer = findInReactTree(res, n => n.type?.displayName === 'BlobMask');
      const indicatorStyle = this.settings.get('indicatorStyle', 'icon');
      const typingUsers = dmTypingStore.getFlattenedDMTypingUsers();

      if (badgeContainer && indicatorStyle === 'badge' && typingUsers.length > 0) {
        badgeContainer.props.lowerBadgeWidth = 28;
        badgeContainer.props.lowerBadge = React.createElement(ConnectedTypingIndicator, { badge: true });
      } else {
        res.splice(1, 0, React.createElement(ConnectedTypingIndicator, {
          className: this.classes.listItem,
          clickable: typingUsers.length === 1
        }));
      }

      return res;
    });
  }

  _forceUpdateHomeButton () {
    forceUpdateElement(`.${getModule([ 'homeIcon', 'downloadProgress' ], false).tutorialContainer}`);
  }

  pluginWillUnload () {
    uninject('dm-typing-indicator');

    this._forceUpdateHomeButton();

    powercord.api.settings.unregisterSettings('dm-typing-indicator');
  }
};
