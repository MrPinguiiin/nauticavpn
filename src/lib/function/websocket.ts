import { 
  DNS_SERVER_ADDRESS, 
  DNS_SERVER_PORT
} from "$lib/variable";
import { runtimeState } from "$lib/variable";
import { 
  handleTCPOutBound, 
  handleUDPOutbound, 
  makeReadableWebSocketStream,
  safeCloseWebSocket
} from "./network";
import { 
  parseNajortHeader, 
  parseSsHeader, 
  parseSselvHeader, 
  protocolSniffer 
} from "./protocol";
import { createWebSocketPair, mockConnect } from "./cloudflare-types";

/**
 * Handler untuk WebSocket connections
 * @param request - Request dari client
 * @returns Response untuk WebSocket
 */
export async function websocketHandler(request: Request): Promise<Response> {
  const webSocketPair = createWebSocketPair();
  const [client, webSocket] = [webSocketPair[0], webSocketPair[1]];

  webSocket.accept();

  let addressLog = "";
  let portLog = "";
  const log = (info: string, event?: any) => {
    console.log(`[${addressLog}:${portLog}] ${info}`, event || "");
  };
  const earlyDataHeader = request.headers.get("sec-websocket-protocol") || "";

  const readableWebSocketStream = makeReadableWebSocketStream(webSocket as unknown as WebSocket, earlyDataHeader, log);

  let remoteSocketWrapper: { value: any } = {
    value: {
      writable: {
        getWriter: () => ({
          write: async () => {},
          releaseLock: () => {}
        })
      }
    }
  };
  let isDNS = false;

  readableWebSocketStream
    .pipeTo(
      new WritableStream({
        async write(chunk, controller) {
          if (isDNS) {
            return handleUDPOutbound(DNS_SERVER_ADDRESS, DNS_SERVER_PORT, chunk, webSocket as unknown as WebSocket, null, log);
          }
          if (remoteSocketWrapper.value) {
            const writer = remoteSocketWrapper.value.writable.getWriter();
            await writer.write(chunk);
            writer.releaseLock();
            return;
          }

          const protocol = await protocolSniffer(chunk);
          let protocolHeader;

          if (protocol === reverse("najorT")) {
            protocolHeader = parseNajortHeader(chunk);
          } else if (protocol === reverse("SSELV")) {
            protocolHeader = parseSselvHeader(chunk);
          } else if (protocol === reverse("skcoswodahS")) {
            protocolHeader = parseSsHeader(chunk);
          } else {
            throw new Error("Unknown Protocol!");
          }

          if (protocolHeader.addressRemote) {
            addressLog = protocolHeader.addressRemote;
          }
          
          if (protocolHeader.portRemote) {
            portLog = `${protocolHeader.portRemote} -> ${protocolHeader.isUDP ? "UDP" : "TCP"}`;
          }

          if (protocolHeader.hasError) {
            throw new Error(protocolHeader.message || "Unknown error");
          }

          if (protocolHeader.isUDP) {
            if (protocolHeader.portRemote === 53) {
              isDNS = true;
            } else {
              throw new Error("UDP only support for DNS port 53");
            }
          }

          if (isDNS) {
            return handleUDPOutbound(
              DNS_SERVER_ADDRESS,
              DNS_SERVER_PORT,
              chunk,
              webSocket as unknown as WebSocket,
              protocolHeader.version || null,
              log
            );
          }

          handleTCPOutBound(
            remoteSocketWrapper,
            protocolHeader.addressRemote || "",
            protocolHeader.portRemote || 0,
            protocolHeader.rawClientData || new ArrayBuffer(0),
            webSocket as unknown as WebSocket,
            protocolHeader.version || null,
            log
          );
        },
        close() {
          log(`readableWebSocketStream is close`);
        },
        abort(reason) {
          log(`readableWebSocketStream is abort`, JSON.stringify(reason));
        },
      })
    )
    .catch((err) => {
      log("readableWebSocketStream pipeTo error", err);
    });

  return new Response("WebSocket Initiated", {
    status: 101
  });
}

/**
 * Function untuk me-reverse string
 * Ini adalah fungsi duplikat karena ada masalah circular dependency
 */
function reverse(str: string): string {
  return str.split("").reverse().join("");
} 