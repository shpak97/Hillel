export {};

declare global {
  namespace PrismaJson {
    type UserMeta = {
      password: string;
      accessToken?: string;
      emailVerified?: boolean;
      verifyEmailLastSentAt?: number;
      passwordResetLastSentAt?: number;
      refreshToken?: string;
    };

    type QrGradient = {
      type: 'linear' | 'radial';
      rotation?: number;
      colorStops: {
        offset: number;
        color: string;
      }[];
    };

    type RestaurantQrStyle = {
      width?: number;
      height?: number;
      margin?: number;
      shape?: 'square' | 'circle';
      qrOptions?: {
        typeNumber?: number;
        mode?: 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji';
        errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
      };
      dotsOptions?: {
        type?:
          | 'dots'
          | 'rounded'
          | 'classy'
          | 'classy-rounded'
          | 'square'
          | 'extra-rounded';
        color?: string;
        gradient?: QrGradient;
        roundSize?: boolean;
      };
      cornersSquareOptions?: {
        type?:
          | 'dot'
          | 'square'
          | 'extra-rounded'
          | 'dots'
          | 'rounded'
          | 'classy'
          | 'classy-rounded';
        color?: string;
        gradient?: QrGradient;
      };
      cornersDotOptions?: {
        type?:
          | 'dot'
          | 'square'
          | 'dots'
          | 'rounded'
          | 'classy'
          | 'classy-rounded'
          | 'extra-rounded';
        color?: string;
        gradient?: QrGradient;
      };
      backgroundOptions?: {
        round?: number;
        color?: string;
        gradient?: QrGradient;
      };
      imageOptions?: {
        hideBackgroundDots?: boolean;
        imageSize?: number;
        margin?: number;
      };
    };
  }
}
