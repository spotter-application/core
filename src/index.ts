#!/usr/bin/env node

import WebSocket from 'websocket';
import CommandLineArgs from 'command-line-args';

export interface Option {
  name: string;
  hint?: string;
  action?: Action;
  onQuery?: OnQuery;
  icon?: string;
  isHovered?: boolean;
  priority?: number;
  important?: boolean;
}

export type OnQuery = (query: string) => Promise<Option[]> | Option[];

export type ActionResult = Option[] | boolean;
export type Action = () => Promise<ActionResult> | ActionResult;

export interface MappedOption {
  name: string;
  hint?: string;
  actionId?: string;
  onQueryId?: string;
  icon?: string;
  isHovered?: boolean;
  priority?: number;
  important?: boolean;
};

enum MessageFromSpotterType {
  onQueryRequest = 'onQueryRequest',
  onOptionQueryRequest = 'onOptionQueryRequest',
  execActionRequest = 'execActionRequest',
  mlSaveSuggestion = 'mlSaveSuggestion',
  onOpenSpotter = 'onOpenSpotter',
};

interface MessageOnQueryRequestFromSpotter {
  id: string;
  type: MessageFromSpotterType.onQueryRequest;
  query: string;
}

interface MessageOnOptionQueryRequestFromSpotter {
  id: string;
  type: MessageFromSpotterType.onOptionQueryRequest;
  onQueryId: string;
  query: string;
}

interface MessageExecActionRequestFromSpotter {
  id: string;
  type: MessageFromSpotterType.execActionRequest;
  actionId: string;
}

interface MessageMlSaveSuggestionFromSpotter {
  type: MessageFromSpotterType.mlSaveSuggestion;
  mlGlobalActionPath: string;
}

interface MessageOnOpenSpotterFromSpotter {
  type: MessageFromSpotterType.onOpenSpotter;
}

type MessageFromSpotter =
  | MessageOnQueryRequestFromSpotter
  | MessageOnOptionQueryRequestFromSpotter
  | MessageExecActionRequestFromSpotter
  | MessageMlSaveSuggestionFromSpotter
  | MessageOnOpenSpotterFromSpotter;

enum MessageFromPluginType {
  pluginReady = 'pluginReady',
  onQueryResponse = 'onQueryResponse',
  onOptionQueryResponse = 'onOptionQueryResponse',
  execActionResponse = 'execActionResponse',
  mlSuggestions = 'mlSuggestions',
}

interface MessagePluginReadyFromPlugin {
  type: MessageFromPluginType.pluginReady;
  connectionId: string;
}

interface MessageOnQueryResponseFromPlugin {
  id: string;
  type: MessageFromPluginType.onQueryResponse;
  options: MappedOption[];
  complete: boolean;
  connectionId: string;
}

interface MessageOnOptionQueryResponseFromPlugin {
  id: string;
  type: MessageFromPluginType.onOptionQueryResponse;
  options: MappedOption[];
  complete: boolean;
  connectionId: string;
}

interface MessageExecActionResponseFromPlugin {
  id: string;
  type: MessageFromPluginType.execActionResponse;
  options: MappedOption[];
  complete: boolean;
  connectionId: string;
}

interface MessageMlSuggestionsFromPlugin {
  type: MessageFromPluginType.mlSuggestions;
  mlGlobalActionPath?: string,
  connectionId: string;
}

type MessageFromPlugin = 
  | MessagePluginReadyFromPlugin
  | MessageOnQueryResponseFromPlugin
  | MessageOnOptionQueryResponseFromPlugin
  | MessageExecActionResponseFromPlugin
  | MessageMlSuggestionsFromPlugin;

const generateId = () => Math.random().toString(16).slice(2);

const COMMAND_LINE_ARG_WEB_SOCKET_PORT = 'web-socket-port';
const COMMAND_LINE_ARG_CONNECTION_ID = 'connection-id';
const COMMAND_LINE_ARG_DEFINITIONS = [
  { name: COMMAND_LINE_ARG_WEB_SOCKET_PORT, type: String },
  { name: COMMAND_LINE_ARG_CONNECTION_ID, type: String },
];

export class SpotterPlugin {
  private actionsMap: {[actionId: string]: Action} = {};
  private onQueryMap: {[onQueryId: string]: OnQuery} = {};
  private client = new WebSocket.client();
  private connection?: WebSocket.connection;
  private commandLineArgs = CommandLineArgs(COMMAND_LINE_ARG_DEFINITIONS);

  constructor() {
    this.spotterInitServer();
  }

  private async connect(): Promise<WebSocket.connection> {
    const port = this.commandLineArgs[COMMAND_LINE_ARG_WEB_SOCKET_PORT] ?? '4040';
    this.client.on('connectFailed', (error) => {
      console.error(error);
    });

    this.client.connect(`ws://0.0.0.0:${port}`);

    return new Promise(resolve => {
      this.client.on('connect', (cl) => {
        resolve(cl);
      });
    });
  }

  private sendMessageToSpotter(message: MessageFromPlugin) {
    if (!this.connection) {
      throw new Error('There is no connection.');
    }

    this.connection.send(JSON.stringify(message));
  }

  private async spotterInitServer() {
    this.connection = await this.connect();

    const connectionId = this.commandLineArgs[COMMAND_LINE_ARG_CONNECTION_ID];
    await this.spotterInitPlugin();
    const message: MessagePluginReadyFromPlugin = {
      connectionId: connectionId ?? 'dev',
      type: MessageFromPluginType.pluginReady,
    };
    this.sendMessageToSpotter(message);

    this.connection.on('message', async (msg: WebSocket.Message) => {
      if (msg.type === 'utf8') {
        const request: MessageFromSpotter = JSON.parse(msg.utf8Data);
        this.spotterHandleRequest(request);
      }
    });
  }

  private async spotterHandleRequest(request: MessageFromSpotter) {
    if (request.type === MessageFromSpotterType.onOpenSpotter) {
      this.spotterOnOpen();
      return;
    }

    if (request.type === MessageFromSpotterType.mlSaveSuggestion) {
      if (request?.mlGlobalActionPath) {
        this.spotterMlOnGlobalActionPath(request.mlGlobalActionPath);
      }
      return;
    }
    
    if (request.type === MessageFromSpotterType.onQueryRequest) {
      const nextOptions: Option[] = this.spotterOnQuery(request.query);
      const mappedOptions = this.spotterMapOptions(nextOptions);
      const message: MessageOnQueryResponseFromPlugin = {
        id: request.id,
        type: MessageFromPluginType.onQueryResponse,
        options: mappedOptions,
        complete: false,
        connectionId: this.commandLineArgs[COMMAND_LINE_ARG_CONNECTION_ID],
      };
      this.sendMessageToSpotter(message);
      return;
    }

    if (request.type === MessageFromSpotterType.execActionRequest) {
      const result: boolean | Option[] = await this.actionsMap[request.actionId]();
      const message: MessageExecActionResponseFromPlugin = {
        id: request.id,
        type: MessageFromPluginType.execActionResponse,
        options: typeof result === 'boolean' ? [] : this.spotterMapOptions(result),
        complete: typeof result === 'boolean' ? result : false,
        connectionId: this.commandLineArgs[COMMAND_LINE_ARG_CONNECTION_ID],
      };
      this.sendMessageToSpotter(message);
      return;
    }

    if (request.type === MessageFromSpotterType.onOptionQueryRequest) {
      const result: boolean | Option[] = await this.onQueryMap[request.onQueryId](request.query);
      const message: MessageOnOptionQueryResponseFromPlugin = {
        id: request.id,
        type: MessageFromPluginType.onOptionQueryResponse,
        options: typeof result === 'boolean' ? [] : this.spotterMapOptions(result),
        complete: typeof result === 'boolean' ? result : false,
        connectionId: this.commandLineArgs[COMMAND_LINE_ARG_CONNECTION_ID],
      };
      this.sendMessageToSpotter(message);
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

  public spotterMlSuggestActionPath(actionPath: string): void {
    const message: MessageMlSuggestionsFromPlugin = {
      type: MessageFromPluginType.mlSuggestions,
      mlGlobalActionPath: actionPath,
      connectionId: this.commandLineArgs[COMMAND_LINE_ARG_CONNECTION_ID],
    };
    this.sendMessageToSpotter(message);
  }

  public spotterInitPlugin(): Promise<void> | void {}

  public spotterMlOnGlobalActionPath(_: string): void {}

  public spotterOnOpen(): void {}

  public spotterOnQuery(_: string): Option[] { return []; }
}
