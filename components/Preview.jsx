const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { Card } = require('powercord/components');
const TypingIndicator = require("./TypingIndicator")

module.exports = class Component extends React.Component {
  constructor () {
    super ();
  }

  render() {
    const { default: Channel } = getModule([ 'isPrivate' ], false);
    const fakeChannel = new Channel({ id: '1337' });
    const FluxTypingUsers = getModuleByDisplayName('FluxContainer(TypingUsers)', false);
    const TypingUsers = new FluxTypingUsers({ channel: fakeChannel }).render().type;

    return <Card>
      <div>Mink</div>
    </Card>;
  }
}