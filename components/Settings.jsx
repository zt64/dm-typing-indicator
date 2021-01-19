/* eslint-disable object-property-newline */
const { React, getModule, i18n: { Messages } } = require('powercord/webpack');
const { SwitchItem, RadioGroup, ColorPickerInput, SliderInput } = require('powercord/components/settings');

const colorUtils = getModule([ 'isValidHex' ], false);

// const Preview = require('./Preview');

module.exports = class Settings extends React.Component {
  render () {
    const { getSetting, toggleSetting, updateSetting } = this.props;

    return <>
      {/* <Preview /> */}
      <RadioGroup
        options={[
          { name: Messages.DMTI_STYLE_BADGE, value: 'badge' },
          { name: Messages.DTMI_STYLE_ICON, value: 'icon' },
          { name: Messages.DMTI_STYLE_TEXT, value: 'text' },
          { name: Messages.DMTI_STYLE_BOTH, value: 'both' }
        ]}
        value={getSetting('indicatorStyle', 'icon')}
        onChange={(e) => updateSetting('indicatorStyle', e.value)}
      >{Messages.DTMI_STYLE_INPUT}</RadioGroup>
      {getSetting('indicatorStyle', 'icon') === 'badge' && <ColorPickerInput
        note={Messages.DMTI_PICKER_BGCOLOR_NOTE}
        default={colorUtils.hex2int('#43b581')}
        value={colorUtils.hex2int(getSetting('indicatorBgColor', '#43b581'))}
        onChange={(value) => updateSetting('indicatorBgColor', colorUtils.int2hex(value))}
      >{Messages.DMTI_PICKER_BGCOLOR}</ColorPickerInput>}
      <SwitchItem
        note={Messages.DTMI_SWITCH_IGNORE_BLOCKED_NOTE}
        value={getSetting('ignoreBlocked', true)}
        onChange={() => toggleSetting('ignoreBlocked', true)}
      >{Messages.DTMI_SWITCH_IGNORE_BLOCKED}</SwitchItem>
      <SwitchItem
        note={Messages.DTMI_SWITCH_IGNORE_NON_FRIEND_NOTE}
        value={getSetting('ignoreNonFriend', true)}
        onChange={() => toggleSetting('ignoreNonFriend', true)}
      >{Messages.DTMI_SWITCH_IGNORE_NON_FRIEND}</SwitchItem>
      <SwitchItem
        note={Messages.DTMI_SWITCH_ANIMATE_INDICATOR_NOTE}
        value={getSetting('animateIndicator', true)}
        onChange={() => toggleSetting('animateIndicator', true)}
      >{Messages.DTMI_SWITCH_ANIMATE_INDICATOR}</SwitchItem>
    </>;
  }
};
