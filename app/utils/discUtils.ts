const colorToImageMap: Record<string, any> = {
  discAqua: require('../../assets/discAqua.png'),
  discBlack: require('../../assets/discBlack.png'),
  discBlue: require('../../assets/discBlue.png'),
  discBrown: require('../../assets/discBrown.png'),
  discClear: require('../../assets/discClear.png'),
  discCream: require('../../assets/discCream.png'),
  discDarkBlue: require('../../assets/discDarkBlue.png'),
  discGlow: require('../../assets/discGlow.png'),
  discGray: require('../../assets/discGray.png'),
  discGreen: require('../../assets/discGreen.png'),
  discHotPink: require('../../assets/discHotPink.png'),
  discLime: require('../../assets/discLime.png'),
  discMaroon: require('../../assets/discMaroon.png'),
  discOrange: require('../../assets/discOrange.png'),
  discPaleBlue: require('../../assets/discPaleBlue.png'),
  discPaleGreen: require('../../assets/discPaleGreen.png'),
  discPalePink: require('../../assets/discPalePink.png'),
  discPalePurple: require('../../assets/discPalePurple.png'),
  discPink: require('../../assets/discPink.png'),
  discPurple: require('../../assets/discPurple.png'),
  discRed: require('../../assets/discRed.png'),
  discSkyBlue: require('../../assets/discSkyBlue.png'),
  discTeal: require('../../assets/discTeal.png'),
  discTieDye: require('../../assets/discTieDye.png'),
  discWhite: require('../../assets/discWhite.png'),
  discYellow: require('../../assets/discYellow.png'),
};

export const getDiscImage = (color: string) => {
  // If color already includes 'disc', use it directly
  const colorKey = color.startsWith('disc') ? color : `disc${color.charAt(0).toUpperCase()}${color.slice(1)}`;
  
  console.log('Getting disc image for:', {
    inputColor: color,
    colorKey,
    availableColors: Object.keys(colorToImageMap),
    hasColor: colorKey in colorToImageMap,
    selectedImage: colorToImageMap[colorKey] || colorToImageMap.discWhite
  });

  // Return the image or default to white if not found
  return colorToImageMap[colorKey] || colorToImageMap.discWhite;
}; 