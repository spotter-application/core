import { filter, lastValueFrom, map, first, BehaviorSubject } from 'rxjs';
import {
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
  StartPluginData,
  Command,
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
    const value = generateId();
    this.spotterSendCommand({type: CommandType.getSettings, value});
    return this.spotterReceiveDataWithId<Settings>(value);
  }

  private spotterPatchSettings = (value: Partial<Settings>) => {
    this.spotterSendCommand({type: CommandType.patchSettings, value});
  }

  private spotterGetStorage = <T>(): Promise<Storage<T>> => {
    const value = generateId();
    this.spotterSendCommand({type: CommandType.getStorage, value});
    return this.spotterReceiveDataWithId<Storage<T>>(value);
  }

  private spotterPatchStorage = <T>(value: Partial<Storage<T>>) => {
    this.spotterSendCommand({type: CommandType.patchStorage, value});
  }

  private spotterSetStorage = <T>(value: Storage<T>) => {
    this.spotterSendCommand({type: CommandType.setStorage, value});
  }

  private spotterSetRegisteredOptions = (input: RegistryOption[]) => {
    const value = this.registryOptionsToSpotterRegistryOptions(input);
    this.spotterSendCommand({type: CommandType.setRegisteredOptions, value});
  }

  private spotterPatchRegisteredOptions = (input: RegistryOption[]) => {
    const value = this.registryOptionsToSpotterRegistryOptions(input);
    this.spotterSendCommand({type: CommandType.patchRegisteredOptions, value});
  }

  private spotterSetOnQueryOptions = (input: OnQueryOption[]) => {
    const value = this.spotterOnQueryOptionsToSpotterOnQueryOptions(input);
    this.spotterSendCommand({type: CommandType.setOnQueryOptions, value});
  }

  private spotterSetPlaceholder = (value: string) => {
    this.spotterSendCommand({type: CommandType.setPlaceholder, value});
  }

  private spotterSetQuery = (value: string) => {
    this.spotterSendCommand({type: CommandType.setQuery, value});
  }

  private spotterSetError = (value: string) => {
    this.spotterSendCommand({type: CommandType.setError, value});
  }

  private spotterOpen = () => {
    this.spotterSendCommand({type: CommandType.open});
  }

  private spotterClose = () => {
    this.spotterSendCommand({type: CommandType.close});
  }

  private spotterGetPlugins = () => {
    const value = generateId();
    this.spotterSendCommand({type: CommandType.getPlugins, value});
    return this.spotterReceiveDataWithId<Plugin[]>(value);
  }

  private spotterAddPlugin = (value: Plugin) => {
    this.spotterSendCommand({type: CommandType.addPlugin, value});
  }

  private spotterStartPlugin = (value: StartPluginData) => {
    this.spotterSendCommand({type: CommandType.startPlugin, value});
  }

  private spotterUpdatePlugin = (value: number) => {
    this.spotterSendCommand({type: CommandType.updatePlugin, value});
  }

  private spotterRemovePlugin = (value: number) => {
    this.spotterSendCommand({type: CommandType.removePlugin, value});
  }

  private spotterSetTheme = (value: string) => {
    this.spotterSendCommand({type: CommandType.setTheme, value});
  }

  private spotterSetLoading = (value: boolean) => {
    this.spotterSendCommand({type: CommandType.setLoading, value});
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

  private spotterSendCommand(command: Command) {
    if (!this.channel) {
      console.error(CHANNEL_ERROR);
      return;
    }

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

        if (
          command.type !== SpotterCommandType.onHover &&
          command.type !== SpotterCommandType.onQueryCancel
        ) {
          this.spotterSetLoading(false);
        }

        if (Array.isArray(result)) {
          this.spotterSetOnQueryOptions(result);
          return;
        }

        if (!result) {
          return;
        }

        this.spotterClose();
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
