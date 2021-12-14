import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Settings, SettingsEntry } from './models/Settings';

interface Props {
  setting: SettingsEntry<any>;
  settings: Settings['settings'];
  setSettings: (settings: Settings['settings']) => void;
}

export const ToggleInput = ({ setting, settings, setSettings }: Props) => {
  const [enable, setEnable] = useState(!!setting.value);
  const value = setting.value ?? setting.defaultValues?.SE; //TODO fix .SE

  const updateSetting = (newSetting: SettingsEntry<any>) =>
    setSettings({ ...settings, [newSetting.name]: newSetting });

  return (
    <View style={style.settingContainer}>
      <Text>{setting.name}: </Text>
      <TouchableOpacity
        onPress={() => {
          setEnable(!enable);
          if (!setting.value) {
            updateSetting({ ...setting, value: value });
          } else {
            delete setting.value;
            updateSetting(setting);
          }
        }}>
        <View style={style.toggleWrapper}>
          <Text>Use: </Text>
          <Text style={style.touchable}>{enable ? 'Yes' : 'No'} </Text>
        </View>
      </TouchableOpacity>
      <TextInput
        style={style.textInput}
        value={value}
        onChangeText={input => updateSetting({ ...setting, value: input })}
      />
    </View>
  );
};

const style = StyleSheet.create({
  touchable: {
    color: 'dodgerblue',
  },
  settingContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleWrapper: {
    flexDirection: 'row',
  },
  textInput: {
    minWidth: 90,
    borderColor: 'black',
    borderRadius: 4,
    borderWidth: 1,
    padding: 2,
  },
});
