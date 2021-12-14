import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { Settings, Keys } from './models/Settings';
import { useDispatch, useStore } from './Store';
import { client } from './Client';
import { ToggleInput } from './ToggleInput';

const SettingOptions = ({
  currentSettings,
}: {
  currentSettings: Settings['settings'];
}): JSX.Element => {
  const [settings, setSettings] =
    React.useState<Settings['settings']>(currentSettings);
  const dispatch = useDispatch();
  const store = useStore();

  const onSave = async () => {
    if (!store.cart?.id || !store.productData) {
      return;
    }
    const checkout = await client.loadCheckout(store.cart.id, settings, true);
    dispatch({
      type: 'ADD',
      data: { ...checkout, productData: { ...store.productData, settings } },
    });
  };

  return (
    <View>
      {Object.keys(settings).map((key, index) => {
        const setting = settings[key as Keys];
        switch (setting.type) {
          case 'color':
            return (
              <View key={index} style={style.settingContainer}>
                <Text>{setting.name}: </Text>
                <TextInput
                  value={setting.value ?? setting.defaultValue}
                  onChangeText={value => {
                    setSettings({ ...settings, [key]: { ...setting, value } });
                  }}
                  style={style.textInput}
                />
              </View>
            );
          case 'toggleinput':
            if (['mobileNumber', 'personalNumber'].includes(key)) {
              return (
                <ToggleInput
                  setting={setting}
                  key={index}
                  settings={settings}
                  setSettings={setSettings}
                />
              );
            } else {
              return null;
            }
        }
      })}
      <TouchableOpacity style={style.button} onPress={onSave}>
        <Text style={style.touchable}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export const SettingsPage = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const settings = store.productData?.settings;

  return (
    <ScrollView style={style.container}>
      <TouchableOpacity
        style={style.button}
        onPress={() => dispatch({ type: 'CHECKOUT_SUCCESS' })}>
        <Text style={style.touchable}>Remove cart</Text>
      </TouchableOpacity>
      {settings && <SettingOptions currentSettings={settings} />}
    </ScrollView>
  );
};

const style = StyleSheet.create({
  container: { backgroundColor: 'white' },
  button: { padding: 16 },
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
  textInput: {
    minWidth: 90,
    borderColor: 'black',
    borderRadius: 4,
    borderWidth: 1,
    padding: 2,
  },
});
