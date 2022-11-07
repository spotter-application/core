import NodemonPlugin = require("nodemon-webpack-plugin");
export const entry: string;
export namespace module {
    const rules: {
        test: RegExp;
        use: string;
        exclude: RegExp;
    }[];
}
export const target: string;
export namespace resolve {
    const extensions: string[];
}
export namespace output {
    const filename: string;
    const path: string;
}
export namespace devServer {
    const filename_1: string;
    export { filename_1 as filename };
    const _static: string;
    export { _static as static };
    export const compress: boolean;
    export const port: number;
}
export const plugins: NodemonPlugin[];
