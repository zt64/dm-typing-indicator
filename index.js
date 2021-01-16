const { Plugin } = require("powercord/entities");
const { React, getModule } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { forceUpdateElement, findInReactTree } = require("powercord/util");

const TypingIndicator = require("./components/TypingIndicator");
const Settings = require("./components/Settings");

module.exports = class DMTypingIndicator extends Plugin {
  constructor () {
    super();

    this.classes = {
      tutorialContainer: getModule([ "homeIcon", "downloadProgress" ], false).tutorialContainer,
      lowerBadge: getModule([ "lowerBadge" ], false).lowerBadge
    };
  }

  async startPlugin () {
    powercord.api.settings.registerSettings("dm-typing-indicator", {
      category: this.entityID,
      label: "DM Typing Indicator",
      render: Settings
    });

    this.loadStylesheet("style.css");
    this.injectPlugin();
  }

  injectPlugin () {
    const { DefaultHomeButton } = getModule([ "DefaultHomeButton" ], false);
    const ConnectedTypingIndicator = this.settings.connectStore(TypingIndicator);

    inject("dm-typing", DefaultHomeButton.prototype, "render", (args, res) => {
      const { props } = findInReactTree(res, r => r.type?.displayName === 'BlobMask');
      console.log(props);
      props.lowerBadge = React.createElement(ConnectedTypingIndicator);
      props.lowerBadgeWidth = 32;

      return res;
    });
  }

  pluginWillUnload () {
    uninject("dm-typing");
    forceUpdateElement(`.${this.classes.tutorialContainer}`);

    powercord.api.settings.unregisterSettings("dm-typing-indicator");
  }
};