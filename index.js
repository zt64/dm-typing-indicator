/* eslint-disable curly, object-property-newline */
const { React, Flux, FluxDispatcher, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree } = require('powercord/util');
const { Plugin } = require('powercord/entities');

const dmTypingStore = require('./stores/dmTypingStore');

const Settings = require('./components/Settings');
const TypingIndicator = require('./components/TypingIndicator');
const i18n = require('./i18n');

module.exports = class DMTypingIndicator extends Plugin {
  constructor () {
    super();

    // must try catch, if you don't, then if this ever errors out, you won't
    try {
      this.classes = {
        listItem: getModule([ 'guildSeparator', 'listItem' ], false).listItem
      };
    } catch (err) {
      this.error('Failed to fetch classes', err);
    }
  }

  get dmTypingStore () {
    return dmTypingStore;
  }

  async startPlugin () {
    powercord.api.settings.registerSettings('dm-typing-indicator', {
      category: 'dm-typing-indicator',
      label: 'DM Typing Indicator',
      render: Settings
    });

    powercord.api.i18n.loadAllStrings(i18n);

    this.loadStylesheet('./style.css');
    this.injectTypingIndicator();
  }

  async injectTypingIndicator () {
    const HomeButtonModule = await getModule([ 'HomeButton' ]);

    // why outside? well, if you do it inside the patch, then it will create a new element each time
    // and if a new element is made each time, it will needlessly rerender each time
    // not is a rerender slow, but it actually reconstructs the entire TypingIndicator class
    // every single time, big nono, especially if you use webpack search in the constructor of TypingIndicator
    const ConnectedTypingIndicator = Flux.connectStores([ powercord.api.settings.store, dmTypingStore ], ({ typingUsersFlat, typingUsers }) => ({
      typingUsers,
      typingUsersFlat,
      ...powercord.api.settings._fluxProps('dm-typing-indicator')
    }))(TypingIndicator);

    inject('dm-typing-indicator', HomeButtonModule, 'HomeButton', ([ props ], res) => {
      const forceUpdate = React.useState({})[1];

      React.useEffect(() => {
        const callback = () => forceUpdate({});

        FluxDispatcher.subscribe('DMTI_REFRESH_HOME', callback);

        return () => FluxDispatcher.unsubscribe('DMTI_REFRESH_HOME', callback);
      }, []);

      if (!Array.isArray(res)) res = [ res ];

      const badgeContainer = findInReactTree(res, n => n.type?.displayName === 'BlobMask');

      const typingUsersFlat = props.typingUsersFlat || dmTypingStore.getFlattenedDMTypingUsers();
      const typingUsers = props.typingUsers || dmTypingStore.getDMTypingUsers();

      const indicatorStyle = this.settings.get('indicatorStyle', 'icon');
      const hideWhenViewed = this.settings.get('hideWhenViewed', true);

      if (hideWhenViewed) {
        const currentDMChannelId = window.location.href.match(/@me\/(\d+)/) && window.location.href.match(/@me\/(\d+)/)[1];
        if (currentDMChannelId && Object.keys(typingUsers).length === 1 && typingUsers[currentDMChannelId]) {
          return res;
        }
      }

      if (badgeContainer && indicatorStyle === 'badge' && typingUsersFlat.length > 0) {
        badgeContainer.props.lowerBadgeWidth = 28;
        badgeContainer.props.lowerBadge = React.createElement(ConnectedTypingIndicator, { badge: true, typingUsersFlat, typingUsers });
      } else {
        res.splice(1, 0, React.createElement(ConnectedTypingIndicator, {
          className: this.classes.listItem,
          clickable: typingUsersFlat.length === 1,
          typingUsersFlat,
          typingUsers
        }));
      }

      return res;
    });
  }

  _forceUpdateHomeButton () {
    FluxDispatcher.dirtyDispatch({ type: 'DMTI_REFRESH_HOME' });
  }

  pluginWillUnload () {
    uninject('dm-typing-indicator');

    this._forceUpdateHomeButton();

    powercord.api.settings.unregisterSettings('dm-typing-indicator');
  }
};
