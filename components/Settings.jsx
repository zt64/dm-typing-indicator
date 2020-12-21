const { React } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings')

module.exports = class Component extends React.Component {
  render() {
    const { getSetting, toggleSetting } = this.props;

    return (
      <SwitchItem
        note='Displays the typing indicator below the Discord icon.'
        value={getSetting('showIndicator', true)}
        onChange={() => toggleSetting('showIndicator')}
      >
        Typing Indicator
      </SwitchItem>
    )
  }
}