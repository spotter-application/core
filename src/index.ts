#!/usr/bin/env node

import WebSocket from 'websocket';

export interface Option {
  name: string;
  action?: Action;
  onQuery?: OnQuery;
}

export type OnQuery = (query: string) => Promise<Option[]> | Option[];

export type Action = () => Promise<Option[] | boolean> | Option[] | boolean;

interface MappedOption {
  name: string;
  actionId?: string;
  onQueryId?: string;
};

enum RequestFromSpotterType {
  onQuery = 'onQuery',
  onOptionQuery = 'onOptionQuery',
  execAction = 'execAction',
};

enum RequestFromPluginType {
  renderOptions = 'renderOptions',
  close = 'close',
  error = 'error',
};

interface RequestFromSpotter {
  id: string,
  type: RequestFromSpotterType,
  data: string,
};

interface RequestFromPlugin {
  id: string,
  type: RequestFromPluginType ,
  data: MappedOption[],
};

const generateId = () => Math.random().toString(16).slice(2);

export class SpotterPlugin {
  private actionsMap: {[actionId: string]: Action} = {};
  private onQueryMap: {[onQueryId: string]: OnQuery} = {};

  constructor() {
    this.spotterInitServer();
  }

  private async spotterInitServer() {
    const client = new WebSocket.client();
    client.connect('ws://0.0.0.0:4040');

    client.on('connect', (cl) => {
      cl.on('message', async (msg: any) => {
        const request: RequestFromSpotter = JSON.parse(msg.utf8Data);
        
        if (request.type === RequestFromSpotterType.onQuery) {
          const nextOptions = await this.onQuery(request.data);

          // TODO: move to function
          if (typeof nextOptions === 'boolean') {
            const response: RequestFromPlugin = {
              id: request.id,
              type: nextOptions ? RequestFromPluginType.close : RequestFromPluginType.error,
              data: [],
            };
            cl.send(JSON.stringify(response));
            return;
          };

          const mappedOptions = this.spotterMapOptions(nextOptions as Option[]);
          const response: RequestFromPlugin = {
            id: request.id,
            type: RequestFromPluginType.renderOptions,
            data: mappedOptions,
          };
          cl.send(JSON.stringify(response));
          return;
        }

        if (request.type === RequestFromSpotterType.execAction) {
          this.actionsMap[request.data]();
          return;
        }

        if (request.type === RequestFromSpotterType.onOptionQuery) {
          const [onQueryId, query] = request.data.split('##');
          const nextOptions = await this.onQueryMap[onQueryId](query);

          // TODO: move to function
          if (typeof nextOptions === 'boolean') {
            const response: RequestFromPlugin = {
              id: request.id,
              type: nextOptions ? RequestFromPluginType.close : RequestFromPluginType.error,
              data: [],
            };
            cl.send(JSON.stringify(response));
            return;
          };

          const mappedOptions = this.spotterMapOptions(nextOptions as Option[]);
          const response: RequestFromPlugin = {
            id: request.id,
            type: RequestFromPluginType.renderOptions,
            data: mappedOptions,
          };
          cl.send(JSON.stringify(response));
          return;
        }
      });
    });

    client.on('connectFailed', (reason) => {
      console.log('connectFailed: ', reason);
    });
  }

  private spotterMapOptions(options: Option[]): MappedOption[] {
    // TODO: optimize
    // this.actionsMap = {};
    // this.onQueryMap = {};

    return options.map(({ name, action, onQuery }) => {
      const mappedOption: MappedOption = {
        name,
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

  public onQuery(_: string): Promise<Option[] | boolean> | Option[] | boolean {
    return true;
  }
}

