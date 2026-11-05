import { Tabs } from 'expo-router';
import { ClipboardList, CreditCard, Home, Menu, Package } from 'lucide-react-native';

import { colors, fonts } from '@/theme';

// Bottom tabs replace SidebarNav (PLAN.md §2); secondary items live under "More".
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> }} />
      <Tabs.Screen name="pos" options={{ title: 'POS', tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} /> }} />
      <Tabs.Screen name="inventory" options={{ title: 'Inventory', tabBarIcon: ({ color, size }) => <Package color={color} size={size} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color, size }) => <Menu color={color} size={size} /> }} />
    </Tabs>
  );
}
