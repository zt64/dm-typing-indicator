const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { Card } = require('powercord/components');

const TypingIndicator = require("./TypingIndicator")

module.exports = class Component extends React.Component {
  constructor () {
    super ();
  }

  render() {
    <Card>Preview</Card>;
  }
}