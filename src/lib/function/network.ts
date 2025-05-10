import { CORS_HEADER_OPTIONS, DNS_SERVER_ADDRESS, DNS_SERVER_PORT, WS_READY_STATE_OPEN, WS_READY_STATE_CLOSING } from "$lib/variable";
import { mockConnect as connect } from "./cloudflare-types";
import { runtimeState } from "$lib/variable";
import { reverse } from "./utils";

/**
 * Menangani outbound koneksi UDP
 */
export async function handleUDPOutbound(targetAddress: string, targetPort: number, udpChunk: ArrayBuffer, webSocket: WebSocket, responseHeader: ArrayBuffer | null, log: (info: string, event?: any) => void) {
  try {
    let protocolHeader = responseHeader;
    const tcpSocket = connect({
      hostname: targetAddress,
      port: targetPort,
    });

    log(`Connected to ${targetAddress}:${targetPort}`);

    const writer = tcpSocket.writable.getWriter();
    await writer.write(udpChunk);
    writer.releaseLock();

    await tcpSocket.readable.pipeTo(
      new WritableStream({
        async write(chunk) {
          if (webSocket.readyState === WS_READY_STATE_OPEN) {
            if (protocolHeader) {
              webSocket.send(await new Blob([protocolHeader, chunk]).arrayBuffer());
              protocolHeader = null;
            } else {
              webSocket.send(chunk);
            }
          }
        },
        close() {
          log(`UDP connection to ${targetAddress} closed`);
        },
        abort(reason) {
          console.error(`UDP connection to ${targetPort} aborted due to ${reason}`);
        },
      })
    );
  } catch (e: any) {
    console.error(`Error while handling UDP outbound, error ${e.message}`);
  }
}

/**
 * Menangani outbound koneksi TCP
 */
export async function handleTCPOutBound(
  remoteSocket: { value: any },
  addressRemote: string,
  portRemote: number,
  rawClientData: ArrayBuffer,
  webSocket: WebSocket,
  responseHeader: ArrayBuffer | null,
  log: (info: string, event?: any) => void
) {
  async function connectAndWrite(address: string, port: number) {
    const tcpSocket = connect({
      hostname: address,
      port: port,
    });
    remoteSocket.value = tcpSocket;
    log(`connected to ${address}:${port}`);
    const writer = tcpSocket.writable.getWriter();
    await writer.write(rawClientData);
    writer.releaseLock();

    return tcpSocket;
  }

  async function retry() {
    const proxyParts = runtimeState.proxyIP.split(/[:=-]/);
    const tcpSocket = await connectAndWrite(
      proxyParts[0] || addressRemote,
      parseInt(proxyParts[1]) || portRemote
    );
    tcpSocket.closed
      .catch((error: any) => {
        console.log("retry tcpSocket closed error", error);
      })
      .finally(() => {
        safeCloseWebSocket(webSocket);
      });
    remoteSocketToWS(tcpSocket, webSocket, responseHeader, null, log);
  }

  const tcpSocket = await connectAndWrite(addressRemote, portRemote);
  remoteSocketToWS(tcpSocket, webSocket, responseHeader, retry, log);
}

/**
 * Mengirimkan data dari socket remote ke WebSocket
 */
export async function remoteSocketToWS(
  remoteSocket: any, 
  webSocket: WebSocket, 
  responseHeader: ArrayBuffer | null, 
  retry: (() => void) | null, 
  log: (info: string, event?: any) => void
) {
  let header = responseHeader;
  let hasIncomingData = false;
  await remoteSocket.readable
    .pipeTo(
      new WritableStream({
        start() {},
        async write(chunk: any, controller: any) {
          hasIncomingData = true;
          if (webSocket.readyState !== WS_READY_STATE_OPEN) {
            controller.error("webSocket.readyState is not open, maybe close");
          }
          if (header) {
            webSocket.send(await new Blob([header, chunk]).arrayBuffer());
            header = null;
          } else {
            webSocket.send(chunk);
          }
        },
        close() {
          log(`remoteConnection!.readable is close with hasIncomingData is ${hasIncomingData}`);
        },
        abort(reason: any) {
          console.error(`remoteConnection!.readable abort`, reason);
        },
      })
    )
    .catch((error: any) => {
      console.error(`remoteSocketToWS has exception `, error.stack || error);
      safeCloseWebSocket(webSocket);
    });
  if (hasIncomingData === false && retry) {
    log(`retry`);
    retry();
  }
}

/**
 * Membuat stream yang dapat dibaca dari WebSocket
 */
export function makeReadableWebSocketStream(
  webSocketServer: WebSocket, 
  earlyDataHeader: string, 
  log: (info: string, event?: any) => void
): ReadableStream {
  let readableStreamCancel = false;
  const stream = new ReadableStream({
    start(controller) {
      webSocketServer.addEventListener("message", (event) => {
        if (readableStreamCancel) {
          return;
        }
        const message = event.data;
        controller.enqueue(message);
      });
      webSocketServer.addEventListener("close", () => {
        safeCloseWebSocket(webSocketServer);
        if (readableStreamCancel) {
          return;
        }
        controller.close();
      });
      webSocketServer.addEventListener("error", (err) => {
        log("webSocketServer has error");
        controller.error(err);
      });
      const { earlyData, error } = base64ToArrayBuffer(earlyDataHeader);
      if (error) {
        controller.error(error);
      } else if (earlyData) {
        controller.enqueue(earlyData);
      }
    },

    pull(controller) {},
    cancel(reason) {
      if (readableStreamCancel) {
        return;
      }
      log(`ReadableStream was canceled, due to ${reason}`);
      readableStreamCancel = true;
      safeCloseWebSocket(webSocketServer);
    },
  });

  return stream;
}

/**
 * Menutup WebSocket dengan aman
 */
export function safeCloseWebSocket(socket: WebSocket) {
  try {
    if (socket.readyState === WS_READY_STATE_OPEN || socket.readyState === WS_READY_STATE_CLOSING) {
      socket.close();
    }
  } catch (error) {
    console.error("safeCloseWebSocket error", error);
  }
}

/**
 * Mengkonversi base64 ke ArrayBuffer
 */
export function base64ToArrayBuffer(base64Str: string): { earlyData?: ArrayBuffer, error?: Error } {
  if (!base64Str) {
    return { error: undefined };
  }
  try {
    base64Str = base64Str.replace(/-/g, "+").replace(/_/g, "/");
    const decode = atob(base64Str);
    const arryBuffer = Uint8Array.from(decode, (c) => c.charCodeAt(0));
    return { earlyData: arryBuffer.buffer, error: undefined };
  } catch (error: any) {
    return { error };
  }
}

/**
 * Mengkonversi ArrayBuffer ke hex string
 */
export function arrayBufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
} 