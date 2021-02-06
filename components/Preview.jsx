const { React, getModule } = require('powercord/webpack');
const { Card, AsyncComponent } = require('powercord/components');

const DefaultHomeButton = AsyncComponent.from(getModule(['DefaultHomeButton']).then(m => m.DefaultHomeButton))

module.exports = class Preview extends React.PureComponent {
  constructor (props) {
    super(props);

    this.previewUsers = [];
    this.state = {
      typingRotation: null,
      currentRotation: 0
    };
  }

  componentWillMount () {
    this.startTypingRotation();
  }

  componentWillUnmount () {
    this.stopTypingRotation();
  }

  render() {
    return <Card className='dmti-preview'>
      <DefaultHomeButton user={'previewUser'} typingUsersFlat={this.fetchPreviewUsersFlat()}/>
    </Card>
  }

  fetchPreviewUsersFlat () {
    const cachedUsers = Object.values(getModule([ 'getUsers' ], false).getUsers())//.filter(user => user.id !== this.props.main.currentUserId);
    const getRandomUserId = () => cachedUsers[Math.floor(Math.random() * cachedUsers.length)].id;
    const users = [];

    const { currentRotation } = this.state;

    for (let i = 0; i < currentRotation + 1; i++) {
      const id = this.previewUsers[i] || getRandomUserId();

      users.push(getModule([ 'getCurrentUser' ], false).getUser(id));
    }

    return users;
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