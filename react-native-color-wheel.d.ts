declare module 'react-native-color-wheel' {
    import { Component } from 'react';
    import { StyleProp, ViewStyle } from 'react-native';

    interface ColorWheelProps {
        /**
         * Initial color for the wheel.
         */
        initialColor?: string;

        /**
         * Callback function when the color selection is complete.
         */
        onColorChangeComplete?: (color: string) => void;

        /**
         * Custom styles for the color wheel.
         */
        style?: StyleProp<ViewStyle>;
    }

    export class ColorWheel extends Component<ColorWheelProps> {}
}
