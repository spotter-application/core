#!/usr/bin/env node

import WebSocket from 'websocket';

export interface Option {
  name: string;
  hint?: string;
  action?: Action;
  onQuery?: OnQuery;
  icon?: string;
  isHovered?: boolean,
  priority?: number,
  important?: boolean,
}

export type OnQuery = (query: string) => Promise<Option[]> | Option[];

export type Action = () => Promise<Option[] | boolean> | Option[] | boolean;

export interface MappedOption {
  name: string;
  hint?: string;
  actionId?: string;
  onQueryId?: string;
  icon?: string;
  isHovered?: boolean,
  priority?: number,
  important?: boolean,
};

enum RequestFromSpotterType {
  onQuery = 'onQuery',
  onOptionQuery = 'onOptionQuery',
  execAction = 'execAction',
  mlOnGlobalActionPath = 'mlOnGlobalActionPath',
  onOpenSpotter = 'onOpenSpotter',
};

interface RequestFromSpotter {
  id: string,
  type: RequestFromSpotterType,
  query: string,
  actionId: string,
  onQueryId: string,
  mlGlobalActionPath?: string,
};

interface RequestFromPlugin {
  id: string,
  options: MappedOption[],
  complete: boolean,
  // TODO: probably rename key to 'data' and set request type
  mlGlobalActionPath?: string,
};

const generateId = () => Math.random().toString(16).slice(2);

export class SpotterPlugin {
  private actionsMap: {[actionId: string]: Action} = {};
  private onQueryMap: {[onQueryId: string]: OnQuery} = {};
  private client = new WebSocket.client();
  private connection?: WebSocket.connection;

  constructor() {
    this.spotterInitServer();
  }

  private async connect(): Promise<WebSocket.connection> {
    this.client.connect('ws://0.0.0.0:4040');
    return new Promise(resolve => {
      this.client.on('connect', (cl) => {
        resolve(cl);
      });
    });
  }

  private async spotterInitServer() {
    this.connection = await this.connect();

    this.connection.on('message', async (msg: WebSocket.Message) => {
      if (msg.type === 'utf8') {
        const request: RequestFromSpotter = JSON.parse(msg.utf8Data);
        this.spotterHandleRequest(request);
      }
    });

    this.client.on('connectFailed', (reason) => {
      console.log('connectFailed: ', reason);
    });
  }

  private async spotterHandleRequest(request: RequestFromSpotter) {
    if (request.type === RequestFromSpotterType.onOpenSpotter) {
      this.onOpenSpotter();
      return;
    }

    if (request.type === RequestFromSpotterType.mlOnGlobalActionPath) {
      if (request?.mlGlobalActionPath) {
        this.mlOnGlobalActionPath(request.mlGlobalActionPath);
      }
      return;
    }
    
    if (request.type === RequestFromSpotterType.onQuery) {
      const nextOptions: Option[] = this.onQuery(request.query);
      const mappedOptions = this.spotterMapOptions(nextOptions);
      const response: RequestFromPlugin = {
        id: request.id,
        options: mappedOptions,
        complete: false,
      };
      this.connection?.send(JSON.stringify(response));
      return;
    }

    if (request.type === RequestFromSpotterType.execAction) {
      const result = await this.actionsMap[request.actionId]();

      // TODO: move to function
      if (typeof result === 'boolean') {
        const response: RequestFromPlugin = {
          id: request.id,
          options: [],
          complete: result,
        };
        this.connection?.send(JSON.stringify(response));
        return;
      };

      const mappedOptions = this.spotterMapOptions(result as Option[]);
      const response: RequestFromPlugin = {
        id: request.id,
        options: mappedOptions,
        complete: false,
      };
      this.connection?.send(JSON.stringify(response));
      return;
    }

    if (request.type === RequestFromSpotterType.onOptionQuery) {
      const nextOptions = await this.onQueryMap[request.onQueryId](request.query);

      if (typeof nextOptions === 'boolean') {
        const response: RequestFromPlugin = {
          id: request.id,
          options: [],
          complete: nextOptions,
        };
        this.connection?.send(JSON.stringify(response));
        return;
      };

      const mappedOptions = this.spotterMapOptions(nextOptions as Option[]);
      const response: RequestFromPlugin = {
        id: request.id,
        options: mappedOptions,
        complete: false,
      };
      this.connection?.send(JSON.stringify(response));
      return;
    }
  }

  private spotterMapOptions(options: Option[]): MappedOption[] {
    // TODO: optimize
    // this.actionsMap = {};
    // this.onQueryMap = {};

    return options.map(({
      name,
      hint,
      icon,
      action,
      onQuery,
      isHovered,
      priority,
      important,
    }) => {
      const mappedOption: MappedOption = {
        name: `${name}`,
        hint,
        icon,
        isHovered,
        priority,
        important,
      };

      if (action) {
        const actionId = generateId();
        this.actionsMap[actionId] = action;
        mappedOption.actionId = actionId;
      }

      if (onQuery) {
        const onQueryId = generateId();
        this.onQueryMap[onQueryId] = onQuery;
        mappedOption.onQueryId = onQueryId;
      }

      return mappedOption;
    });
  }

  public mlSuggestActionPath(actionPath: string): void {
    if (!this.connection) {
      return;
    }

    const request: RequestFromPlugin = {
      id: '',
      options: [],
      complete: false,
      mlGlobalActionPath: actionPath,
    };
    this.connection?.send(JSON.stringify(request));
  }

  public mlOnGlobalActionPath(_: string): void {}
  public onOpenSpotter(): void {}
  public onQuery(_: string): Option[] { return []; }
}
