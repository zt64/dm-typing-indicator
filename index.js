const { Plugin } = require('powercord/entities');
const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { forceUpdateElement } = require('powercord/util');

const TypingIndicator = require('./components/TypingIndicator')
const Settings = require('./components/Settings')

module.exports = class DMTypingIndicator extends Plugin {
  constructor () {
    super();

    this.classes = {
      tutorialContainer: (getModule([ 'homeIcon', 'downloadProgress' ], false)).tutorialContainer
    };
  }

  async startPlugin () {
    powercord.api.settings.registerSettings('dm-typing-indicator', {
      category: this.entityID,
      label: 'DM Typing Indicator',
      render: Settings
    });

    this.ConnectedTypingIndicator = this.settings.connectStore(TypingIndicator);

    this.loadStylesheet('style.css');
    this.injectPlugin();
  }

  injectPlugin() {
    const { DefaultHomeButton } = getModule([ 'DefaultHomeButton' ], false);

    inject('dm-typing', DefaultHomeButton.prototype, 'render', (args, res) => {
      res.props.children = [ res.props.children ];
      res.props.children.push(React.createElement(this.ConnectedTypingIndicator));

      return res;
    });
  }

  pluginWillUnload () {
    uninject('dm-typing');
    forceUpdateElement(`.${this.classes.tutorialContainer}`);

    powercord.api.settings.unregisterSettings('dm-typing-indicator')
  }
};