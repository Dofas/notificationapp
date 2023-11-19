import { StatusBar } from 'expo-status-bar';
import { Alert, Button, StyleSheet, View, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import * as Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {

  function scheduleNotification() {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'My first local notification',
        body: 'This is a body of a notification',
        data: {
          userName: 'Yevhen',
          metadata: 'Object to extract data in a code'
        }
      },
      trigger: {
        seconds: 5,
      }
    });
  }

  useEffect(() => {
    async function configurePushNotification() {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permission required', 'Push notifications need the appropriate permissions');
        return;
      }

      console.log('Constants.default.expoConfig?.extra?.eas.projectId', Constants.default.expoConfig?.extra?.eas.projectId)

      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        'projectId': Constants.default.expoConfig?.extra?.eas.projectId,
      });
      console.log('pushTokenData', pushTokenData);

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT
        });
      }
    }

    configurePushNotification();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          alert('You need to enable notifications for this app to receive them.');
        }
      }
    })();

    // when app is running and notification was received
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('received listener');
      const userName = notification.request.content.data?.userName;
      console.log('userName', userName);
    });

    // when user clicked on notification
    const responseReceivedSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('receivedResponse listener');
      const userName = response.notification.request.content.data?.userName;
      console.log('userName', userName);
    });

    return () => {
      receivedSubscription.remove();
      responseReceivedSubscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Schedule notification" onPress={scheduleNotification} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
