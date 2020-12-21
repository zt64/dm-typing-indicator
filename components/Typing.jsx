const { React } = require('powercord/webpack');
const { Tooltip, Spinner } = require('powercord/components');

module.exports = class Component extends React.Component {
  render() {
    const userNames = this.props.users.map(user => user.username);
    const tooltip = this.props.users.length === 1 ? `${userNames.join(' ')} is typing...` : `${userNames.join(' ')} are typing...`
    const showIndicator = this.props.getSetting('showIndicator', true);

    return (
      <Tooltip color='black' position='right' text={tooltip} className='typing-indicator'>
        {showIndicator && <Spinner type='pulsingEllipsis' animated={true} style={{ marginLeft: 5, opacity: 0.7 }}/>}
        <h1>{`${this.props.users.length} typing...`}</h1>
      </Tooltip>
    )
  }
}