declare module '*.jpg' {
    const value: string; // Tell TS that the default export of a .jpg module is a string
    export default value;
}

declare module '*.jpeg' {
    const value: string; // Tell TS that the default export of a .jpeg module is a string
    export default value;
}