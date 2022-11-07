#!/usr/bin/env node
import WebSocket from 'websocket';
;
var RequestFromSpotterType;
(function (RequestFromSpotterType) {
    RequestFromSpotterType["onQuery"] = "onQuery";
    RequestFromSpotterType["onOptionQuery"] = "onOptionQuery";
    RequestFromSpotterType["execAction"] = "execAction";
})(RequestFromSpotterType || (RequestFromSpotterType = {}));
;
var RequestFromPluginType;
(function (RequestFromPluginType) {
    RequestFromPluginType["renderOptions"] = "renderOptions";
    RequestFromPluginType["close"] = "close";
    RequestFromPluginType["error"] = "error";
})(RequestFromPluginType || (RequestFromPluginType = {}));
;
;
;
const generateId = () => Math.random().toString(16).slice(2);
export class SpotterPlugin {
    constructor() {
        this.actionsMap = {};
        this.onQueryMap = {};
        this.spotterInitServer();
    }
    async spotterInitServer() {
        const client = new WebSocket.client();
        client.connect('ws://0.0.0.0:4040');
        client.on('connect', (cl) => {
            cl.on('message', async (msg) => {
                const request = JSON.parse(msg.utf8Data);
                if (request.type === RequestFromSpotterType.onQuery) {
                    const nextOptions = await this.onQuery(request.data);
                    // TODO: move to function
                    if (typeof nextOptions === 'boolean') {
                        const response = {
                            id: request.id,
                            type: nextOptions ? RequestFromPluginType.close : RequestFromPluginType.error,
                            data: [],
                        };
                        cl.send(JSON.stringify(response));
                        return;
                    }
                    ;
                    const mappedOptions = this.spotterMapOptions(nextOptions);
                    const response = {
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
                        const response = {
                            id: request.id,
                            type: nextOptions ? RequestFromPluginType.close : RequestFromPluginType.error,
                            data: [],
                        };
                        cl.send(JSON.stringify(response));
                        return;
                    }
                    ;
                    const mappedOptions = this.spotterMapOptions(nextOptions);
                    const response = {
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
    spotterMapOptions(options) {
        // TODO: optimize
        // this.actionsMap = {};
        // this.onQueryMap = {};
        return options.map(({ name, action, onQuery }) => {
            const actionId = generateId();
            this.actionsMap[actionId] = action;
            const mappedOption = {
                name,
                actionId,
            };
            if (onQuery) {
                const onQueryId = generateId();
                this.onQueryMap[onQueryId] = onQuery;
                mappedOption.onQueryId = onQueryId;
            }
            return mappedOption;
        });
    }
    onQuery(_) {
        return true;
    }
}
//# sourceMappingURL=index.js.map