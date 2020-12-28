const { React, Flux, getModule } = require('powercord/webpack');
const { Tooltip, Spinner } = require('powercord/components');

const fluxConnector = Flux.connectStoresAsync(
  [
    getModule([ 'getTypingUsers' ]),
    getModule([ 'getCurrentUser' ]),
    getModule([ 'getPrivateChannels' ]),
    getModule([ 'isBlocked', 'isFriend' ])
  ],
  ([ typingStore, userStore, privateChannelsStore, blockedStore ], { getSetting }) => ({
    users: Object.keys(privateChannelsStore.getPrivateChannels())
      .map(channelID => Object.keys(typingStore.getTypingUsers(channelID)))
      .flat()
      .filter(id => id !== userStore.getCurrentUser().id)
      .filter(id => getSetting('ignoreNonFriend', false) ? blockedStore.isFriend(id) : true)
      .filter(id => getSetting('ignoreBlocked', true) ? !blockedStore.isBlocked(id) : true)
      .map(id => userStore.getUser(id))
  })
);

class TypingIndicator extends React.Component {
  constructor () {
    super();

    this.m = getModule([ 'openPrivateChannel' ], false);

    this.setStyle = (style, users) => {
      switch (style) {
        case "icon":
          return <Spinner type='pulsingEllipsis' animated={true} style={{ marginLeft: 5, opacity: 0.7 }}/>
        case "text":
          return <h1>{`${users.length} typing...`}</h1>
        case "both":
          return <>
            <Spinner type='pulsingEllipsis' animated={true} style={{ marginLeft: 5, opacity: 0.7 }}/>
            <h1>{`${users.length} typing...`}</h1>
          </>
      }
    }
  }

  render() {
    const { users } = this.props;
    
    if (!users.length) return null;

    const userNames = users.map(user => user.username);
    const tooltip = users.length === 1 ? `${userNames[0]} is typing...` : `${userNames.join(', ')} are typing...`
    const indicatorStyle = this.props.getSetting('indicatorStyle', 'icon');

    return (
      <div onClick={async () => users.length === 1 && await this.m.openPrivateChannel(users[0].id)}>
        <Tooltip color='black' position='right' text={tooltip} className='dm-typing-indicator'>
          {this.setStyle(indicatorStyle, users)}
        </Tooltip>
      </div> 
    )
  }
}

module.exports = fluxConnector(TypingIndicator);
