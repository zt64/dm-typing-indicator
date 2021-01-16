/* eslint-disable object-property-newline */
const { React, Flux, getModule, i18n: { Messages } } = require('powercord/webpack');
const { Tooltip, Spinner } = require('powercord/components');

const dmTypingStore = require('../stores/dmTypingStore');

class TypingIndicator extends React.PureComponent {
  constructor () {
    super();

    this.channelUtils = getModule([ 'openPrivateChannel' ], false);
  }

  async handleOnClick (typingUsers) {
    return typingUsers.length === 1 && this.channelUtils.openPrivateChannel(typingUsers[0].id);
  }

  renderIndicator (typingUsers) {
    const indicator = [];
    const indicatorStyle = this.props.getSetting('indicatorStyle', 'icon');
    const animateIndicator = this.props.getSetting('animateIndicator', true);

    if (indicatorStyle === 'icon' || indicatorStyle === 'both') {
      indicator.push(<Spinner type='pulsingEllipsis' animated={animateIndicator} style={{ opacity: 0.7, marginBottom: indicatorStyle === 'both' ? 5 : '' }} />);
    }

    if (indicatorStyle === 'text' || indicatorStyle === 'both') {
      indicator.push(`${typingUsers.length} typing...`);
    }

    return indicator;
  }

  render () {
    const { typingUsers } = this.props;

    if (typingUsers.length > 0) {
      const usernames = typingUsers.map(user => <strong>{user.username}</strong>);
      const strings = [];

      usernames.forEach(username => {
        if (usernames.indexOf(username) !== usernames.length - 1) {
          strings.push(username);
          strings.push(', ');
        } else {
          strings.splice(-1, 1, ' and ');
          strings.push(username);
          strings.push(' ');
        }

        return strings;
      });

      const tooltipText = typingUsers.length === 1 ? Messages.ONE_USER_TYPING.format({ a: usernames[0] }) : [ strings, 'are typing...' ];

      if (this.props.badge) {
        return <Spinner type='pulsingEllipsis' animated={true} className='dm-typing-badge' itemClassName='dm-typing-badge-spinner' />;
      }

      return <div className={this.props.className} onClick={this.handleOnClick.bind(this, typingUsers)}>
        <Tooltip color='black' position='right' text={tooltipText} className={!this.props.badge ? 'dm-typing-indicator' : ''}>
          {this.renderIndicator(typingUsers, !!this.props.badge)}
        </Tooltip>
      </div>;
    }

    return null;
  }
}

module.exports = Flux.connectStoresAsync([ dmTypingStore ], ([ dmTypingStore ]) => ({
  typingUsers: dmTypingStore.getDMTypingUsers()
}))(TypingIndicator);
