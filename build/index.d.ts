#!/usr/bin/env node
export interface Option {
    name: string;
    action?: Action;
    onQuery?: OnQuery;
}
export declare type OnQuery = (query: string) => Promise<Option[]> | Option[];
export declare type Action = () => Promise<Option[] | boolean> | Option[] | boolean;
export declare class SpotterPlugin {
    private actionsMap;
    private onQueryMap;
    constructor();
    private spotterInitServer;
    private spotterMapOptions;
    onQuery(_: string): Promise<Option[] | boolean> | Option[] | boolean;
}
