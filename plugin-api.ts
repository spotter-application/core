import { filter, lastValueFrom, map, first, BehaviorSubject } from 'rxjs';
import {
  SpotterOption,
  CommandType,
  Settings,
  SpotterCommand,
  SpotterCommandType,
  Storage,
  OnQueryAction,
  ActionResult,
  ChannelForPlugin,
  Action,
  OnQueryOption,
  SpotterOnQueryOption,
  RegistryOption,
  SpotterRegistryOption,
  Plugin,
  PluginConnection,
} from './interfaces';
import { generateId } from './helpers';

const CHANNEL_ERROR = 'CHANNEL has not been passed/initialized.';

export class SpotterPluginApi {
  private channel?: ChannelForPlugin;

  private getDataCommand$ = new BehaviorSubject<{
    id: string,
    data: Settings | Storage<unknown> | Plugin[],
  } | null>(null);

  private actionsRegistry: {[id: string]: Action | OnQueryAction} = {};

  constructor(channel: Promise<ChannelForPlugin>) {
    this.spotterInitPlugin(channel);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onInit() {}

  // API
  private spotterGetSettings = (): Promise<Settings> => {
    const id = generateId();
    this.spotterSendCommand(CommandType.getSettings, id);
    return this.spotterReceiveDataWithId<Settings>(id);
  }

  private spotterPatchSettings = (value: Partial<Settings>) => {
    this.spotterSendCommand(CommandType.patchSettings, value);
  }

  private spotterGetStorage = <T>(): Promise<Storage<T>> => {
    const id = generateId();
    this.spotterSendCommand(CommandType.getStorage, id);
    return this.spotterReceiveDataWithId<Storage<T>>(id);
  }

  private spotterPatchStorage = <T>(value: Partial<Storage<T>>) => {
    this.spotterSendCommand(CommandType.patchStorage, value);
  }

  private spotterSetStorage = <T>(value: Storage<T>) => {
    this.spotterSendCommand(CommandType.setStorage, value);
  }

  private spotterSetRegisteredOptions = (input: RegistryOption[]) => {
    const value = this.registryOptionsToSpotterRegistryOptions(input);
    this.spotterSendCommand(CommandType.setRegisteredOptions, value);
  }

  private spotterPatchRegisteredOptions = (input: RegistryOption[]) => {
    const value = this.registryOptionsToSpotterRegistryOptions(input);
    this.spotterSendCommand(CommandType.patchRegisteredOptions, value);
  }

  private spotterSetOnQueryOptions = (input: OnQueryOption[]) => {
    const value = this.spotterOnQueryOptionsToSpotterOnQueryOptions(input);
    this.spotterSendCommand(CommandType.setOnQueryOptions, value);
  }

  private spotterSetPlaceholder = (value: string) => {
    this.spotterSendCommand(CommandType.setPlaceholder, value);
  }

  private spotterSetQuery = (value: string) => {
    this.spotterSendCommand(CommandType.setQuery, value);
  }

  private spotterSetError = (value: string) => {
    this.spotterSendCommand(CommandType.setError, value);
  }

  private spotterOpen = () => {
    this.spotterSendCommand(CommandType.open);
  }

  private spotterClose = () => {
    this.spotterSendCommand(CommandType.close);
  }

  private spotterGetPlugins = () => {
    const id = generateId();
    this.spotterSendCommand(CommandType.getPlugins, id);
    return this.spotterReceiveDataWithId<Plugin[]>(id);
  }

  private spotterAddPlugin = (value: Plugin) => {
    this.spotterSendCommand(CommandType.addPlugin, value);
  }

  private spotterStartPlugin = (value: string) => {
    this.spotterSendCommand(CommandType.startPlugin, value);
  }

  private spotterUpdatePlugin = (value: string) => {
    this.spotterSendCommand(CommandType.updatePlugin, value);
  }

  private spotterRemovePlugin = (value: string) => {
    this.spotterSendCommand(CommandType.removePlugin, value);
  }

  private spotterSetTheme = (value: string) => {
    this.spotterSendCommand(CommandType.setTheme, value);
  }

  private spotterSetLoading = (value: boolean) => {
    this.spotterSendCommand(CommandType.setLoading, value);
  }

  readonly spotter = {
    getSettings: this.spotterGetSettings,
    patchSettings: this.spotterPatchSettings,
    getStorage: this.spotterGetStorage,
    setStorage: this.spotterSetStorage,
    patchStorage: this.spotterPatchStorage,
    setRegisteredOptions: this.spotterSetRegisteredOptions,
    patchRegisteredOptions: this.spotterPatchRegisteredOptions,
    setPlaceholder: this.spotterSetPlaceholder,
    setQuery: this.spotterSetQuery,
    setError: this.spotterSetError,
    open: this.spotterOpen,
    close: this.spotterClose,
    plugins: {
      get: this.spotterGetPlugins,
      add: this.spotterAddPlugin,
      start: this.spotterStartPlugin,
      update: this.spotterUpdatePlugin,
      remove: this.spotterRemovePlugin,
    },
    setTheme: this.spotterSetTheme,
  }

  // Helpers
  private spotterOnQueryOptionsToSpotterOnQueryOptions(
    value: Array<OnQueryOption>,
  ): Array<SpotterOnQueryOption> {
    return value.map<OnQueryOption>(option => {
      let onSubmitId: string | null = null;
      let onHoverId: string | null = null;
      let onQueryId: string | null = null;
      let onQueryCancelId: string | null = null;

      if (option.onSubmit) {
        onSubmitId = generateId();
        this.actionsRegistry[onSubmitId] = option.onSubmit;
      }

      if (option.onHover) {
        onHoverId = generateId();
        this.actionsRegistry[onHoverId] = option.onHover;
      }

      if (option.onQuery) {
        onQueryId = generateId();
        this.actionsRegistry[onQueryId] = option.onQuery;
      }

      if (option.onQueryCancel) {
        onQueryCancelId = generateId();
        this.actionsRegistry[onQueryCancelId] = option.onQueryCancel;
      }

      return {
        title: option.title,
        subtitle: option.subtitle,
        onSubmitId,
        onHoverId,
        onQueryId,
        onQueryCancelId,
        icon: option.icon,
        replaceOptions: option.replaceOptions,
        hovered: option.hovered,
        priority: option.priority,
      };
    });
  }

  private registryOptionsToSpotterRegistryOptions(
    value: Array<RegistryOption>,
  ): Array<SpotterRegistryOption> {
    return value.map<RegistryOption>(option => {
      let onSubmitId: string | null = null;
      let onQueryId: string | null = null;
      let onQueryCancelId: string | null = null;

      if (option.onSubmit) {
        onSubmitId = generateId();
        this.actionsRegistry[onSubmitId] = option.onSubmit;
      }

      if (option.onQuery) {
        onQueryId = generateId();
        this.actionsRegistry[onQueryId] = option.onQuery;
      }

      if (option.onQueryCancel) {
        onQueryCancelId = generateId();
        this.actionsRegistry[onQueryCancelId] = option.onQueryCancel;
      }

      return {
        title: option.title,
        subtitle: option.subtitle,
        onSubmitId,
        onQueryId,
        onQueryCancelId,
        icon: option.icon,
        replaceOptions: option.replaceOptions,
        prefix: option.prefix,
      };
    });
  }

  private spotterReceiveDataWithId<T>(id: string): Promise<T> {
    return lastValueFrom(
      this.getDataCommand$.pipe(
        filter(command => command?.id === id),
        map(command => command?.data),
        first(),
      ),
    ) as Promise<T>;
  }

  private spotterSendCommand(type: CommandType.startPlugin, value: string): void;
  private spotterSendCommand(type: CommandType.close, value?: null): void;
  private spotterSendCommand(type: CommandType.getPlugins, value: string): void;
  private spotterSendCommand(type: CommandType.getSettings, value: string): void;
  private spotterSendCommand(type: CommandType.getStorage, value: string): void;
  private spotterSendCommand(type: CommandType.open, value?: null): void;
  private spotterSendCommand(type: CommandType.patchSettings, value: Partial<Settings>): void;
  private spotterSendCommand<T>(type: CommandType.patchStorage, value: Partial<Storage<T>>): void;
  private spotterSendCommand(type: CommandType.setRegisteredOptions, value: SpotterOption[]): void;
  private spotterSendCommand(type: CommandType.patchRegisteredOptions, value: SpotterOption[]): void;
  private spotterSendCommand(type: CommandType.removePlugin, value: string): void;
  private spotterSendCommand(type: CommandType.setError, value: string): void;
  private spotterSendCommand(type: CommandType.setPlaceholder, value: string): void;
  private spotterSendCommand(type: CommandType.setOnQueryOptions, value: SpotterOnQueryOption[]): void;
  private spotterSendCommand(type: CommandType.setQuery, value: string): void;
  private spotterSendCommand<T>(type: CommandType.setStorage, value: Storage<T>): void;
  private spotterSendCommand(type: CommandType.addPlugin, value: Plugin): void;
  private spotterSendCommand(type: CommandType.pluginStarted, value: PluginConnection): void;
  private spotterSendCommand(type: CommandType.updatePlugin, value: string): void;
  private spotterSendCommand(type: CommandType.removePlugin, value: string): void;
  private spotterSendCommand(type: CommandType.setTheme, value: string): void;
  private spotterSendCommand(type: CommandType.setLoading, value: boolean): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private spotterSendCommand(type: CommandType, value: any) {
    if (!this.channel) {
      console.error(CHANNEL_ERROR);
      return;
    }

    const command = {
      type,
      value,
    };

    this.channel.sendToSpotter(JSON.stringify(command));
  }

  // Init plugin
  private async spotterInitPlugin(channel: Promise<ChannelForPlugin>) {
    this.channel = await channel;
    this.channel.onSpotter('message', async (data: string) => {
      const command: SpotterCommand = JSON.parse(data);

      if (command.type === SpotterCommandType.onInit) {
        this.onInit();
        return;
      }

      if (
        command.type === SpotterCommandType.onHover ||
        command.type === SpotterCommandType.onSubmit ||
        command.type === SpotterCommandType.onQuery ||
        command.type === SpotterCommandType.onQueryCancel
      ) {
        const actionId = command.type === SpotterCommandType.onHover
          ? command.onHoverId
          : command.type === SpotterCommandType.onSubmit
            ? command.onSubmitId
              : command.type === SpotterCommandType.onQuery
              ? command.onQueryId
                : command.type === SpotterCommandType.onQueryCancel
                  ? command.onQueryCancelId
                  : null;

        if (!actionId) {
          console.error('There is no action id.');
          return;
        }

        const action = this.actionsRegistry[actionId];

        if (!action) {
          console.error('There is no onQuery action in registry.');
          return;
        }

        if (
          command.type !== SpotterCommandType.onHover &&
          command.type !== SpotterCommandType.onQueryCancel
        ) {
          this.spotterSetLoading(true);
        }

        const result: ActionResult = await action.bind(this)(
          command.type === SpotterCommandType.onQuery
            ? command.query
            : '',
        );

        if (Array.isArray(result)) {
          this.spotterSetOnQueryOptions(result);

          if (
            command.type !== SpotterCommandType.onHover &&
            command.type !== SpotterCommandType.onQueryCancel
          ) {
            this.spotterSetLoading(false);
          }
          return;
        }

        if (typeof result === 'boolean' && !result) {
          if (
            command.type !== SpotterCommandType.onHover &&
            command.type !== SpotterCommandType.onQueryCancel
          ) {
            this.spotterSetLoading(false);
          }
          return;
        }

        if (command.type !== SpotterCommandType.onHover) {
          if (command.type !== SpotterCommandType.onQueryCancel) {
            this.spotterSetLoading(false);
          }
          this.spotterClose();
        }
        return;
      }

      if (
        command.type === SpotterCommandType.onGetSettings ||
        command.type === SpotterCommandType.onGetStorage ||
        command.type === SpotterCommandType.onGetPlugins
      ) {
        this.getDataCommand$.next(command.value);
        return;
      }

      console.error('unknown command: ', command);
    });
  }
}
