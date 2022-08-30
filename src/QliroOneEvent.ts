import { NativeSyntheticEvent } from 'react-native';

export type QliroOneNativeEvent<M, T extends string> = NativeSyntheticEvent<{
  [P in T]: M;
}>;
