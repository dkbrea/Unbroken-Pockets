'use strict';

var anatomy = require('@chakra-ui/anatomy');
var styledSystem = require('@chakra-ui/styled-system');
var themeTools = require('@chakra-ui/theme-tools');

const { defineMultiStyleConfig, definePartsStyle } = styledSystem.createMultiStyleConfigHelpers(anatomy.progressAnatomy.keys);
const filledStyle = styledSystem.defineStyle((props) => {
  const { colorScheme: c, theme: t, isIndeterminate, hasStripe } = props;
  const stripeStyle = themeTools.mode(
    themeTools.generateStripe(),
    themeTools.generateStripe("1rem", "rgba(0,0,0,0.1)")
  )(props);
  const bgColor = themeTools.mode(`${c}.500`, `${c}.200`)(props);
  const gradient = `linear-gradient(
    to right,
    transparent 0%,
    ${themeTools.getColor(t, bgColor)} 50%,
    transparent 100%
  )`;
  const addStripe = !isIndeterminate && hasStripe;
  return {
    ...addStripe && stripeStyle,
    ...isIndeterminate ? { bgImage: gradient } : { bgColor }
  };
});
const baseStyleLabel = styledSystem.defineStyle({
  lineHeight: "1",
  fontSize: "0.25em",
  fontWeight: "bold",
  color: "white"
});
const baseStyleTrack = styledSystem.defineStyle((props) => {
  return {
    bg: themeTools.mode("gray.100", "whiteAlpha.300")(props)
  };
});
const baseStyleFilledTrack = styledSystem.defineStyle((props) => {
  return {
    transitionProperty: "common",
    transitionDuration: "slow",
    ...filledStyle(props)
  };
});
const baseStyle = definePartsStyle((props) => ({
  label: baseStyleLabel,
  filledTrack: baseStyleFilledTrack(props),
  track: baseStyleTrack(props)
}));
const sizes = {
  xs: definePartsStyle({
    track: { h: "1" }
  }),
  sm: definePartsStyle({
    track: { h: "2" }
  }),
  md: definePartsStyle({
    track: { h: "3" }
  }),
  lg: definePartsStyle({
    track: { h: "4" }
  })
};
const progressTheme = defineMultiStyleConfig({
  sizes,
  baseStyle,
  defaultProps: {
    size: "md",
    colorScheme: "blue"
  }
});

exports.progressTheme = progressTheme;
