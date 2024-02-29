// ServerSentEvent 服务端实现
import { ServerSentEventStream } from "$std/http/server_sent_event_stream.ts";

class 源 {
  _连接: Set<ReadableStreamDefaultController>;
  _c?: ReadableStreamDefaultController;

  constructor(连接: Set<ReadableStreamDefaultController>) {
    this._连接 = 连接;
  }

  start(controller: ReadableStreamDefaultController) {
    this._连接.add(controller);
    this._c = controller;
  }

  cancel(e: unknown) {
    console.log(e);
    this._连接.delete(this._c!);
  }
}

export class SSE {
  // 保存连接, 用于发送消息
  _连接: Set<ReadableStreamDefaultController>;

  constructor() {
    this._连接 = new Set();
  }

  请求() {
    const s = new ReadableStream(new 源(this._连接));

    const body = s.pipeThrough(new ServerSentEventStream());
    return new Response(body, {
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
      },
    });
  }

  发送消息(m: unknown) {
    for (const i of this._连接) {
      try {
        i.enqueue({
          data: JSON.stringify(m),
        });
      } catch (e) {
        console.log(e);

        // 出错, 移除
        this._连接.delete(i);
      }
    }
  }
}
