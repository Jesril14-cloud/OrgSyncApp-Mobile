import { Redirect } from 'expo-router';

export default function Index() {
  // When the app starts, immediately go to the login screen
  return <Redirect href="/login" />;
}