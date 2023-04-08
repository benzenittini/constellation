
declare const WEBPACK: {
    APP_VERSION: string
};

// Prevents sporadic "Cannot find module './image.png'" compilation error
declare module "*.png";