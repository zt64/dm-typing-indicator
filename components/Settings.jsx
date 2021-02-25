/* eslint-disable object-property-newline */
const { React, getModule, i18n: { Messages } } = require('powercord/webpack');
const { SwitchItem, RadioGroup, ColorPickerInput, SliderInput } = require('powercord/components/settings');
const { FormTitle } = require('powercord/components');

const colorUtils = getModule([ 'isValidHex' ], false);

const Preview = require('./Preview');

module.exports = class Settings extends React.Component {
  render () {
    const { getSetting, toggleSetting, updateSetting } = this.props;
    const indicatorStyle = getSetting('indicatorStyle', 'icon');

    return <>
      <FormTitle tag='h2' className='dmti-settings-title'>{Messages.SETTINGS}</FormTitle>

      <div className='dmti-preview-container'>
        <FormTitle>{Messages.FORM_LABEL_VIDEO_PREVIEW}</FormTitle>
        <Preview/>
      </div>

      <RadioGroup
        options={[
          { name: Messages.DMTI_STYLE_BADGE, value: 'badge' },
          { name: Messages.DTMI_STYLE_ICON, value: 'icon' },
          { name: Messages.DMTI_STYLE_TEXT, value: 'text' },
          { name: Messages.DMTI_STYLE_BOTH, value: 'both' }
        ]}
        value={indicatorStyle}
        onChange={(e) => updateSetting('indicatorStyle', e.value)}
      >{Messages.DMTI_STYLE_INPUT}</RadioGroup>
      {indicatorStyle === 'badge' && <ColorPickerInput
        note={Messages.DMTI_PICKER_BGCOLOR_NOTE}
        default={colorUtils.hex2int('#43b581')}
        value={colorUtils.hex2int(getSetting('indicatorBgColor', '#43b581'))}
        onChange={(value) => updateSetting('indicatorBgColor', colorUtils.int2hex(value))}
      >{Messages.DMTI_PICKER_BGCOLOR}</ColorPickerInput>}
      {(indicatorStyle === 'text' || indicatorStyle === 'both') && <SliderInput
        className='dmti-settings-slider'
        note={Messages.DTMI_SLIDER_MAX_USERS_NOTE}
        stickToMarkers
        initialValue={getSetting('maxTypingUsers', 3)}
        markers={[ 3, 4, 5, 6, 7, 8 ]}
        onMarkerRender={marker => marker === 3 ? Messages.DEFAULT : Messages.NUM_USERS.format({ num: marker })}
        defaultValue={getSetting('maxTypingUsers', 3)}
        onValueChange={value => updateSetting('maxTypingUsers', value)}
      >{Messages.DTMI_SLIDER_MAX_USERS}</SliderInput>}
      <SwitchItem
        note={Messages.DTMI_SWITCH_HIDE_WHEN_VIEWED_NOTE}
        value={getSetting('hideWhenViewed', true)}
        onChange={() => toggleSetting('hideWhenViewed', true)}
      >{Messages.DTMI_SWITCH_HIDE_WHEN_VIEWED}</SwitchItem>
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
