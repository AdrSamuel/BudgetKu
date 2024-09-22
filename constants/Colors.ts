/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#d79921";
const tintColorDark = "#d79921";

export const Colors = {
  light: {
    text: "#282828",
    background: "#fbf1c7",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#fbf1c7",
    background: "#282828",
    tint: tintColorDark,
    icon: "#928374",
    tabIconDefault: "#928374",
    tabIconSelected: tintColorDark,
  },
};
