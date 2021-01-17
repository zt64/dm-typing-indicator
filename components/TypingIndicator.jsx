/* eslint-disable object-property-newline */
const { React, Flux, getModule, i18n: { Messages } } = require('powercord/webpack');
const { Tooltip, Spinner } = require('powercord/components');

const dmTypingStore = require('../stores/dmTypingStore');

class TypingIndicator extends React.PureComponent {
  constructor (props) {
    super(props);

    this.getSetting = props.getSetting;
    this.channelUtils = getModule([ 'openPrivateChannel' ], false);
  }

  async handleOnClick (typingUsers) {
    return typingUsers.length === 1 && this.channelUtils.openPrivateChannel(typingUsers[0].id);
  }

  formatUsernames () {
    const strings = [];
    const usernames = this.props.typingUsers.map(user => user.username);

    if (usernames.length === 1) {
      return Messages.ONE_USER_TYPING.format({ a: usernames[0] });
    }

    const threeUsersTyping = Messages.THREE_USERS_TYPING.format({ a: null, b: null, c: null });
    const typingStrings = threeUsersTyping.filter(element => typeof element === 'string');
    const translations = Object.fromEntries(typingStrings.map((str, index) => {
      const keys = [ 'user', 'comma', 'and', 'typing' ];
      const key = [ keys[strings.length > 3 ? index : index + 1] ];

      return [ key, str ];
    }));

    usernames.forEach(username => {
      const boldUsername = <strong>{username}</strong>;

      if (usernames.indexOf(username) !== usernames.length - 1) {
        strings.push(boldUsername);
        strings.push(translations.comma);
      } else {
        strings.splice(-1, 1, translations.and);
        strings.push(boldUsername);
        strings.push(translations.typing);
      }
    });

    return strings;
  }

  renderIndicator () {
    const { typingUsers } = this.props;

    const indicator = [];
    const indicatorStyle = this.getSetting('indicatorStyle', 'icon');
    const animateIndicator = this.getSetting('animateIndicator', true);

    if (indicatorStyle === 'icon' || indicatorStyle === 'both') {
      indicator.push(<Spinner type='pulsingEllipsis' animated={animateIndicator} style={{ opacity: 0.7, marginBottom: indicatorStyle === 'both' ? 5 : '' }} />);
    }

    if (indicatorStyle === 'text' || indicatorStyle === 'both') {
      indicator.push(Messages.DTMI_TYPING_USERS_COUNT.format({ count: typingUsers.length }));
    }

    return indicator;
  }

  render () {
    const { typingUsers } = this.props;

    if (typingUsers.length > 0) {
      const tooltipText = this.formatUsernames();

      if (this.props.badge) {
        const badgeStyle = { backgroundColor: this.getSetting('indicatorBgColor', '#43b581') };
        const animateIndicator = this.getSetting('animateIndicator', true);

        return <Spinner type='pulsingEllipsis' animated={animateIndicator} className='dm-typing-badge' itemClassName='dm-typing-badge-spinner' style={badgeStyle} />;
      }

      return <div className={this.props.className} onClick={this.handleOnClick.bind(this, typingUsers)}>
        <Tooltip color='black' position='right' text={tooltipText} className={!this.props.badge ? 'dm-typing-indicator' : ''}>
          {this.renderIndicator()}
        </Tooltip>
      </div>;
    }

    return null;
  }
}

module.exports = Flux.connectStoresAsync([ dmTypingStore ], ([ dmTypingStore ]) => ({
  typingUsers: dmTypingStore.getDMTypingUsers()
}))(TypingIndicator);
