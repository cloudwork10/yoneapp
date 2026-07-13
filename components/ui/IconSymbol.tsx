// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Partial<Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'play.rectangle.fill': 'video-library',
  'graduationcap.fill': 'school',
  'play.circle.fill': 'play-circle-filled',
  'map.fill': 'map',
  'doc.text.fill': 'article',
  'ellipsis.circle.fill': 'more-horiz',
  'star.fill': 'star',
  'person.3.fill': 'groups',
  'lightbulb.fill': 'lightbulb',
  'book.fill': 'menu-book',
  'doc.fill': 'description',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name] ?? 'circle'} style={style} />;
}
