const { React, Flux, getModule } = require('powercord/webpack');
const { Card, AsyncComponent } = require('powercord/components');

class Preview extends React.PureComponent {
  constructor (props) {
    super(props);

    this.previewUsers = [];
    this.state = {
      typingRotation: null,
      currentRotation: 0
    };

    this.DefaultHomeButton = getModule([ 'HomeButton' ], false).HomeButton;
    this.getUsers = getModule([ 'getUsers' ], false).getUsers;
  }

  componentWillMount () {
    this.startTypingRotation();
  }

  componentWillUnmount () {
    this.stopTypingRotation();
  }

  render () {
    const [ typingUsersFlat, typingUsers ] = this.fetchPreviewUsers();

    return <Card className='dmti-preview'>
      <this.DefaultHomeButton user={'previewUser'} typingUsersFlat={typingUsersFlat} typingUsers={typingUsers}/>
    </Card>;
  }

  fetchPreviewUsers () {
    const cachedUsers = Object.values(this.getUsers());// .filter(user => user.id !== this.props.main.currentUserId);
    const getRandomUserId = () => cachedUsers[Math.floor(Math.random() * cachedUsers.length)].id;
    const typingUsers = { 1337: {} };

    const { currentRotation } = this.state;

    for (let i = 0; i < currentRotation + 1; i++) {
      const userId = this.previewUsers[i] || getRandomUserId();

      if (!this.previewUsers[i]) {
        this.previewUsers[i] = userId;
      }

      typingUsers['1337'][userId] = cachedUsers.find(user => user.id === userId);
    }

    const maxTypingUsers = this.props.getSetting('maxTypingUsers', 3);
    if (currentRotation === 3 && maxTypingUsers > 3) {
      for (let i = currentRotation + 1; i < maxTypingUsers + 1; i++) {
        const userId = getRandomUserId();
        typingUsers['1337'][userId] = cachedUsers.find(user => user.id === userId);
      }
    }

    return [ Object.values(typingUsers['1337']).flat(), typingUsers ];
  }

  startTypingRotation () {
    let { typingRotation, currentRotation } = this.state;

    if (!typingRotation) {
      typingRotation = setInterval(() => {
        currentRotation = (currentRotation + 1) % 4;

        if (currentRotation === 3) {
          this.previewUsers = [];
        }

        this.setState({
          typingRotation,
          currentRotation
        });
      }, 10e3);
    }
  }

  stopTypingRotation () {
    clearInterval(this.state.typingRotation);
  }
}

module.exports = Flux.connectStores([ powercord.api.settings.store ], () => ({
  ...powercord.api.settings._fluxProps('dm-typing-indicator')
}))(Preview);
