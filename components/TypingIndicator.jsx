/* eslint-disable new-cap, object-property-newline */
const { React, getModule, i18n: { Messages }, constants: { Routes } } = require('powercord/webpack');
const { Tooltip, Spinner } = require('powercord/components');

module.exports = class TypingIndicator extends React.PureComponent {
  constructor (props) {
    super(props);

    this.getSetting = props.getSetting;
    this.channelStore = getModule([ 'hasChannel' ], false);
    this.channelUtils = getModule([ 'openPrivateChannel' ], false);
  }

  async handleOpenPrivateChannel (typingUsers, user) {
    const { transitionTo } = await getModule([ 'transitionTo' ]);

    const channelIds = Object.keys(typingUsers);
    const privateGroupChannel = Object.values(this.channelStore.getMutablePrivateChannels()).find(channel => (
      channel.isGroupDM() && channel.id === channelIds[0]
    ));

    if (privateGroupChannel) {
      return transitionTo(Routes.CHANNEL('@me', privateGroupChannel.id));
    }

    return this.channelUtils.openPrivateChannel(user.id);
  }

  formatUsernames () {
    const strings = [];
    const usernames = this.props.typingUsersFlat.map(user => user.username);

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
    const { typingUsersFlat } = this.props;

    const indicator = [];
    const indicatorStyle = this.getSetting('indicatorStyle', 'icon');
    const animateIndicator = this.getSetting('animateIndicator', true);

    if (indicatorStyle === 'icon' || indicatorStyle === 'both') {
      indicator.push(<Spinner type='pulsingEllipsis' animated={animateIndicator} style={{ opacity: 0.7, marginBottom: indicatorStyle === 'both' ? 5 : '' }} />);
    }

    if (indicatorStyle === 'text' || indicatorStyle === 'both') {
      indicator.push(Messages.DTMI_TYPING_USERS_COUNT.format({ count: typingUsersFlat.length }));
    }

    return indicator;
  }

  render () {
    const { clickable, typingUsers, typingUsersFlat } = this.props;

    if (typingUsersFlat.length === 0) return null;

    if (this.props.badge) {
      const badgeStyle = { backgroundColor: this.getSetting('indicatorBgColor', '#43b581') };
      const animateIndicator = this.getSetting('animateIndicator', true);

      return <Spinner type='pulsingEllipsis' animated={animateIndicator} className='dm-typing-badge' itemClassName='dm-typing-badge-spinner' style={badgeStyle} />;
    }

    return <div className={this.props.className} onClick={clickable && this.handleOpenPrivateChannel.bind(this, typingUsers, typingUsersFlat[0])}>
      <Tooltip
        color='black'
        position='right'
        text={this.formatUsernames()}
        className={!this.props.badge ? [ 'dm-typing-indicator', clickable && 'clickable' ].filter(Boolean).join(' ') : ''}
      >
        {this.renderIndicator()}
      </Tooltip>
    </div>;
  }
}
