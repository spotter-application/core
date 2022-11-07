import { Settings as NodemonOptions } from 'nodemon';

// We prioritise supporting CommonJS than ES6 syntax here.
// Typescript users will have to add `esModuleInterop` in `compilerOptions`
// or set `"allowSyntheticDefaultImports": true`.
// https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
export = NodemonPlugin;

declare class NodemonPlugin {
  constructor(options?: NodemonOptions);

  // yields error TS2321: Excessive stack depth comparing types 'NodemonPlugin' and '((this: Compiler, compiler: Compiler) => void) | WebpackPluginInstance'.
  //apply(compiler: webpack.Compiler): void;
  apply(compiler: any): void;
}
