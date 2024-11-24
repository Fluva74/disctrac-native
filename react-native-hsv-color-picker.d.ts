declare module 'react-native-hsv-color-picker' {
    import { Component } from 'react';
    import { StyleProp, ViewStyle } from 'react-native';

    export interface ColorPickerResult {
        hue: number;
        saturation: number;
        value: number;
    }

    export interface HsvColorPickerProps {
        huePickerHue: number;
        onHuePickerDragMove?: (color: ColorPickerResult) => void;
        onHuePickerPress?: (color: ColorPickerResult) => void;
        satValPickerHue: number;
        satValPickerSaturation: number;
        satValPickerValue: number;
        onSatValPickerDragMove?: (color: ColorPickerResult) => void;
        onSatValPickerPress?: (color: ColorPickerResult) => void;
        style?: StyleProp<ViewStyle>;
    }

    export default class HsvColorPicker extends Component<HsvColorPickerProps> {}
}
