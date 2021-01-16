const { React } = require("powercord/webpack");
const { SwitchItem, RadioGroup } = require("powercord/components/settings");
const Preview = require('./Preview');

module.exports = class Settings extends React.Component {
  render () {
    const { getSetting, toggleSetting, updateSetting } = this.props;

    return <>
      <Preview/>
      <RadioGroup
        options={[
          { name: "Icon: Show just an icon.", value: "icon" },
          { name: "Text: Show just text.", value: "text" },
          { name: "Both: Show both an icon and text.", value: "both" }
        ]}
        value={getSetting("indicatorStyle", "icon")}
        onChange={(e) => updateSetting("indicatorStyle", e.value)}
      >Indicator Style</RadioGroup>
      <SwitchItem
        note="Don't show indicator for users who are blocked."
        value={getSetting("ignoreBlocked", true)}
        onChange={() => toggleSetting("ignoreBlocked", true)}
      >Ignore Blocked Users</SwitchItem>
      <SwitchItem
        note="Don't show indicator for users who you are not friends with."
        value={getSetting("ignoreNonFriend", true)}
        onChange={() => toggleSetting("ignoreNonFriend", true)}
      >Ignore Non-Friend Users</SwitchItem>
      <SwitchItem
        note="Animate the indicator even if the Discord window isn't focused."
        value={getSetting("animateIndicator", true)}
        onChange={() => toggleSetting("animateIndicator", true)}
      >Animate Indicator</SwitchItem>
    </>;
  }
};
