// Metro bundles local WebP files as React Native image sources.
declare module '*.webp' {
  const source: import('react-native').ImageSourcePropType;
  export = source;
}
