import { trimTopic } from "../utils";

import Locale, { getLang } from "../locales";
import { showToast } from "../components/ui-lib";
import { ModelConfig, ModelType, useAppConfig } from "./config";
import { createEmptyMask, Mask } from "./mask";
import {
  DEFAULT_INPUT_TEMPLATE,
  DEFAULT_SYSTEM_TEMPLATE,
  StoreKey,
  SUMMARIZE_MODEL,
} from "../constant";
import { api, RequestMessage } from "../client/api";
import { ChatControllerPool } from "../client/controller";
import { prettyObject } from "../utils/format";
import { estimateTokenLength } from "../utils/token";
import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";

import { extractArrayFromString } from "../visual/extract";
import { Props } from "../components/visual_props";
import { contains5ElementList } from "../visual/extract";
import { getSteps } from "../visual/extract";
export type ChatMessage = RequestMessage & {
  date: string;
  streaming?: boolean;
  isError?: boolean;
  id: string;
  model?: ModelType;
};
const emptyprops: Props = {
  type: "no_animation",
  data: [],
  maxidx: -1,
  compareidx: -1,
  messageId: "",
  newData: [],
  number: -1,
};
export function createMessage(override: Partial<ChatMessage>): ChatMessage {
  return {
    id: nanoid(),
    date: new Date().toLocaleString(),
    role: "user",
    content: "",
    animation: emptyprops,
    ...override,
  };
}

export interface ChatStat {
  tokenCount: number;
  wordCount: number;
  charCount: number;
}

export interface ChatSession {
  sortdata: {
    oldData: number[];
    newData: number[];
  };
  findmaxdata: {
    data: number[];
    maxidx: number;
    compareidx: number;
    compare_start: boolean;
  };
  searchnumberdata: {
    data: number[];
    animationshowed: number;
  };
  id: string;
  topic: string;

  memoryPrompt: string;
  messages: ChatMessage[];
  stat: ChatStat;
  lastUpdate: number;
  lastSummarizeIndex: number;
  clearContextIndex?: number;

  mask: Mask;
}

export const DEFAULT_TOPIC = Locale.Store.DefaultTopic;
export const BOT_HELLO: ChatMessage = createMessage({
  role: "assistant",
  content: Locale.Store.BotHello,
});

function createEmptySession(): ChatSession {
  return {
    sortdata: {
      oldData: [0], //新加
      newData: [0],
    },
    findmaxdata: {
      data: [],
      maxidx: 0,
      compareidx: 1,
      compare_start: false,
    },
    searchnumberdata: {
      data: [],
      animationshowed: 0,
    },
    id: nanoid(),
    topic: DEFAULT_TOPIC,
    memoryPrompt: "",
    messages: [],
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,

    mask: createEmptyMask(),
  };
}

function getSummarizeModel(currentModel: string) {
  // if it is using gpt-* models, force to use 3.5 to summarize
  return currentModel.startsWith("gpt") ? SUMMARIZE_MODEL : currentModel;
}

interface ChatStore {
  sessions: ChatSession[];
  currentSessionIndex: number;
  clearSessions: () => void;
  moveSession: (from: number, to: number) => void;
  selectSession: (index: number) => void;
  newSession: (mask?: Mask) => void;
  deleteSession: (index: number) => void;
  currentSession: () => ChatSession;
  nextSession: (delta: number) => void;
  onNewMessage: (message: ChatMessage) => void;
  onUserInput: (content: string) => Promise<void>;
  summarizeSession: () => void;
  updateStat: (message: ChatMessage) => void;
  updateCurrentSession: (updater: (session: ChatSession) => void) => void;
  updateMessage: (
    sessionIndex: number,
    messageIndex: number,
    updater: (message?: ChatMessage) => void,
  ) => void;
  resetSession: () => void;
  getMessagesWithMemory: () => ChatMessage[];
  getMemoryPrompt: () => ChatMessage;

  clearAllData: () => void;
}

function countMessages(msgs: ChatMessage[]) {
  return msgs.reduce((pre, cur) => pre + estimateTokenLength(cur.content), 0);
}

function fillTemplateWith(input: string, modelConfig: ModelConfig) {
  const vars = {
    model: modelConfig.model,
    time: new Date().toLocaleString(),
    lang: getLang(),
    input: input,
  };

  let output = modelConfig.template ?? DEFAULT_INPUT_TEMPLATE;

  // must contains {{input}}
  const inputVar = "{{input}}";
  if (!output.includes(inputVar)) {
    output += "\n" + inputVar;
  }

  Object.entries(vars).forEach(([name, value]) => {
    output = output.replaceAll(`{{${name}}}`, value);
  });

  return output;
}

const DEFAULT_CHAT_STATE = {
  sessions: [createEmptySession()],
  currentSessionIndex: 0,
};

export const useChatStore = createPersistStore(
  DEFAULT_CHAT_STATE,
  (set, _get) => {
    function get() {
      return {
        ..._get(),
        ...methods,
      };
    }

    const methods = {
      clearSessions() {
        set(() => ({
          sessions: [createEmptySession()],
          currentSessionIndex: 0,
        }));
      },

      selectSession(index: number) {
        set({
          currentSessionIndex: index,
        });
      },

      moveSession(from: number, to: number) {
        set((state) => {
          const { sessions, currentSessionIndex: oldIndex } = state;

          // move the session
          const newSessions = [...sessions];
          const session = newSessions[from];
          newSessions.splice(from, 1);
          newSessions.splice(to, 0, session);

          // modify current session id
          let newIndex = oldIndex === from ? to : oldIndex;
          if (oldIndex > from && oldIndex <= to) {
            newIndex -= 1;
          } else if (oldIndex < from && oldIndex >= to) {
            newIndex += 1;
          }

          return {
            currentSessionIndex: newIndex,
            sessions: newSessions,
          };
        });
      },

      newSession(mask?: Mask) {
        const session = createEmptySession();

        if (mask) {
          const config = useAppConfig.getState();
          const globalModelConfig = config.modelConfig;

          session.mask = {
            ...mask,
            modelConfig: {
              ...globalModelConfig,
              ...mask.modelConfig,
            },
          };
          session.topic = mask.name;
        }

        set((state) => ({
          currentSessionIndex: 0,
          sessions: [session].concat(state.sessions),
        }));
      },

      nextSession(delta: number) {
        const n = get().sessions.length;
        const limit = (x: number) => (x + n) % n;
        const i = get().currentSessionIndex;
        get().selectSession(limit(i + delta));
      },

      deleteSession(index: number) {
        const deletingLastSession = get().sessions.length === 1;
        const deletedSession = get().sessions.at(index);

        if (!deletedSession) return;

        const sessions = get().sessions.slice();
        sessions.splice(index, 1);

        const currentIndex = get().currentSessionIndex;
        let nextIndex = Math.min(
          currentIndex - Number(index < currentIndex),
          sessions.length - 1,
        );

        if (deletingLastSession) {
          nextIndex = 0;
          sessions.push(createEmptySession());
        }

        // for undo delete action
        const restoreState = {
          currentSessionIndex: get().currentSessionIndex,
          sessions: get().sessions.slice(),
        };

        set(() => ({
          currentSessionIndex: nextIndex,
          sessions,
        }));

        showToast(
          Locale.Home.DeleteToast,
          {
            text: Locale.Home.Revert,
            onClick() {
              set(() => restoreState);
            },
          },
          5000,
        );
      },

      currentSession() {
        let index = get().currentSessionIndex;
        const sessions = get().sessions;

        if (index < 0 || index >= sessions.length) {
          index = Math.min(sessions.length - 1, Math.max(0, index));
          set(() => ({ currentSessionIndex: index }));
        }

        const session = sessions[index];

        return session;
      },

      onNewMessage(message: ChatMessage) {
        get().updateCurrentSession((session) => {
          session.messages = session.messages.concat();
          session.lastUpdate = Date.now();
        });
        get().updateStat(message);
        get().summarizeSession();
      },

      async onUserInput(content: string) {
        const session = get().currentSession();
        const modelConfig = session.mask.modelConfig;

        const userContent = fillTemplateWith(content, modelConfig);
        console.log("[User Input] after template: ", userContent);

        const userMessage: ChatMessage = createMessage({
          role: "user",
          content: userContent,
        });

        const botMessage: ChatMessage = createMessage({
          role: "assistant",
          streaming: true,
          model: modelConfig.model,
        });

        // get recent messages
        const recentMessages = get().getMessagesWithMemory();
        const sendMessages = recentMessages.concat(userMessage);
        const messageIndex = get().currentSession().messages.length + 1;

        // save user's and bot's message
        get().updateCurrentSession((session) => {
          const savedUserMessage = {
            ...userMessage,
            content,
          };
          session.messages = session.messages.concat([
            savedUserMessage,
            botMessage,
          ]);
        });

        // make request
        api.llm.chat({
          messages: sendMessages,
          config: { ...modelConfig, stream: true },
          onUpdate(message) {
            botMessage.streaming = true;
            if (message) {
              botMessage.content = message;
            }
            get().updateCurrentSession((session) => {
              session.messages = session.messages.concat();
            });
          },
          onFinish(message) {
            botMessage.streaming = false;
            if (message) {
              botMessage.content = message;

              if (session.mask.name == "pAIr for Bubble Sort") {
                const extractedData = extractArrayFromString(message);
                const arrayData = Array.isArray(extractedData)
                  ? extractedData
                  : [];

                //message中没有数组
                if (arrayData.length == 1 && arrayData[0] == 1) {
                  console.log("message中没有数组的情况");
                  botMessage.animation = emptyprops; //message中没有数组的情况，不显示svg
                } else if (
                  //message中第一次出现数组：显示静态数组
                  session.sortdata.oldData.length == 1 &&
                  session.sortdata.oldData[0] == 0
                ) {
                  console.log("message中第一次出现数组:显示静态数组");
                  session.sortdata.oldData = arrayData;

                  let barchartprops: Props = {
                    type: "barchart",
                    data: session.sortdata.oldData,
                    newData: session.sortdata.newData,
                    messageId: botMessage.id,

                    maxidx: -1,
                    compareidx: -1,
                    number: -1,
                  };
                  botMessage.animation = barchartprops; //应该能够得到一个静态的svg
                } else {
                  console.log("正常情况");
                  session.sortdata.newData = arrayData;
                  console.log("olddata:", session.sortdata.oldData);
                  console.log("newdata:", session.sortdata.newData);

                  let barchartprops: Props = {
                    type: "barchart",
                    data: session.sortdata.oldData,
                    newData: session.sortdata.newData,
                    messageId: botMessage.id,

                    maxidx: -1,
                    compareidx: -1,
                    number: -1,
                  };
                  botMessage.animation = barchartprops;
                  session.sortdata.oldData = session.sortdata.newData;
                }
              }
              // ***********************changingAllNumber**************
              // if (session.mask.name == "pAIr for Change Number") {
              //   const extractedData = extractArrayFromString(message);
              //   const arrayData = Array.isArray(extractedData)
              //     ? extractedData
              //     : [];
              //   //message中没有数组
              //   if (arrayData.length == 1 && arrayData[0] == 1) {
              //     console.log("message中没有数组的情况");
              //     botMessage.animation = emptyprops; //message中没有数组的情况，不显示svg
              //   } else if (
              //     //message中第一次出现数组：显示静态数组
              //     session.sortdata.oldData.length == 1 &&
              //     session.sortdata.oldData[0] == 0
              //   ) {
              //     console.log("message中第一次出现数组:显示静态数组");
              //     session.sortdata.oldData = arrayData;

              //     let barchartprops: Props = {
              //       type: "changingAllNumber",
              //       data: session.sortdata.oldData,
              //       newData: session.sortdata.newData,
              //       messageId: botMessage.id,
              //       maxidx: -1,
              //       compareidx: -1,
              //       number: -1,
              //     };
              //     botMessage.animation = barchartprops; //应该能够得到一个静态的svg
              //   } else {
              //     console.log("正常情况");
              //     session.sortdata.newData = arrayData;
              //     console.log("olddata:", session.sortdata.oldData);
              //     console.log("newdata:", session.sortdata.newData);

              //     let barchartprops: Props = {
              //       type: "changingAllNumber",
              //       data: session.sortdata.oldData,
              //       newData: session.sortdata.newData,
              //       messageId: botMessage.id,
              //       maxidx: -1,
              //       compareidx: -1,
              //       number: -1,
              //     };
              //     botMessage.animation = barchartprops;
              //     session.sortdata.oldData = session.sortdata.newData;
              //   }
              // }
              // // ****************************findmax*******************
              // if (session.mask.name == "FindMax") {
              //   // 检查是否出现five_element_list:
              //   if (contains5ElementList(message)) {
              //     // 首先得到list
              //     if (session.findmaxdata.data.length === 0) {
              //       const extractedData_f = extractArrayFromString(message);
              //       const arrayData_f = Array.isArray(extractedData_f)
              //         ? extractedData_f
              //         : [];
              //       if (arrayData_f.length === 5) {
              //         session.findmaxdata.data = arrayData_f;
              //       }
              //     }

              //     // 设定：比较开始
              //     session.findmaxdata.compare_start = true;
              //   }
              //   if (session.findmaxdata.compare_start) {
              //     console.log("start!!!!");
              //     if (getSteps(message, "第一次比较")) {
              //       console.log("第一次比较");
              //       session.findmaxdata.maxidx = 0;
              //       session.findmaxdata.compareidx = 1;
              //       if (
              //         session.findmaxdata.data[1] > session.findmaxdata.data[0]
              //       ) {
              //         session.findmaxdata.maxidx = 1;
              //       }
              //     }
              //     if (getSteps(message, "第二次比较")) {
              //       session.findmaxdata.compareidx = 2;
              //       if (
              //         session.findmaxdata.data[2] >
              //         session.findmaxdata.data[session.findmaxdata.maxidx]
              //       ) {
              //         session.findmaxdata.maxidx = 2;
              //       }
              //     }
              //     if (getSteps(message, "第三次比较")) {
              //       session.findmaxdata.compareidx = 3;
              //       if (
              //         session.findmaxdata.data[3] >
              //         session.findmaxdata.data[session.findmaxdata.maxidx]
              //       ) {
              //         session.findmaxdata.maxidx = 3;
              //       }
              //     }
              //     if (getSteps(message, "第四次比较")) {
              //       session.findmaxdata.compareidx = 4;
              //       if (
              //         session.findmaxdata.data[4] >
              //         session.findmaxdata.data[session.findmaxdata.maxidx]
              //       ) {
              //         session.findmaxdata.maxidx = 4;
              //       }
              //     }
              //   }

              //   let findmaxprops: Props = {
              //     type: "findmax",
              //     data: session.findmaxdata.data,
              //     maxidx: session.findmaxdata.maxidx,
              //     compareidx: session.findmaxdata.compareidx,
              //     messageId: botMessage.id,

              //     newData: [],
              //     number: -1,
              //   };

              //   if (session.findmaxdata.data.length !== 5) {
              //     console.log("session.findmaxdata.data.length !== 5");
              //     console.log(session.findmaxdata.data);
              //     console.log(message);
              //     findmaxprops = emptyprops;
              //   } else if (session.findmaxdata.compareidx == 4) {
              //     findmaxprops = emptyprops;
              //   }

              //   botMessage.animation = findmaxprops;
              // }
              if (session.mask.name == "FindMax") {
                // 检查是否出现five_element_list:
                if (
                  !session.findmaxdata.compare_start &&
                  contains5ElementList(message)
                ) {
                  // 首先得到list
                  console.log("这里", message);
                  if (session.findmaxdata.data.length === 0) {
                    const extractedData_f = extractArrayFromString(message);
                    console.log("extractedData_f: ", extractedData_f);
                    const arrayData_f = Array.isArray(extractedData_f)
                      ? extractedData_f
                      : [];
                    if (arrayData_f.length === 5) {
                      session.findmaxdata.data = arrayData_f;
                    }
                  }

                  // 设定：比较开始 不应该在这
                  //session.findmaxdata.compare_start = true;
                }

                if (getSteps(message, "第一次比较")) {
                  session.findmaxdata.compare_start = true;
                  console.log("compare start!!!!");
                  console.log("第一次比较");

                  session.findmaxdata.maxidx = 0;
                  session.findmaxdata.compareidx = 1;
                  const findmaxprops1: Props = {
                    type: "findmax",
                    data: session.findmaxdata.data,
                    maxidx: session.findmaxdata.maxidx,
                    compareidx: session.findmaxdata.compareidx,
                    messageId: botMessage.id,

                    newData: [],
                    number: -1,
                  };
                  botMessage.animation = findmaxprops1;
                  if (
                    session.findmaxdata.data[1] > session.findmaxdata.data[0]
                  ) {
                    session.findmaxdata.maxidx = 1;
                  }
                }

                if (session.findmaxdata.compare_start) {
                  if (getSteps(message, "第二次比较")) {
                    session.findmaxdata.compareidx = 2;
                    const findmaxprops2: Props = {
                      type: "findmax",
                      data: session.findmaxdata.data,
                      maxidx: session.findmaxdata.maxidx,
                      compareidx: session.findmaxdata.compareidx,
                      messageId: botMessage.id,

                      newData: [],
                      number: -1,
                    };
                    botMessage.animation = findmaxprops2;
                    if (
                      session.findmaxdata.data[2] >
                      session.findmaxdata.data[session.findmaxdata.maxidx]
                    ) {
                      session.findmaxdata.maxidx = 2;
                    }
                  }
                  if (getSteps(message, "第三次比较")) {
                    session.findmaxdata.compareidx = 3;
                    const findmaxprops3: Props = {
                      type: "findmax",
                      data: session.findmaxdata.data,
                      maxidx: session.findmaxdata.maxidx,
                      compareidx: session.findmaxdata.compareidx,
                      messageId: botMessage.id,

                      newData: [],
                      number: -1,
                    };
                    botMessage.animation = findmaxprops3;
                    if (
                      session.findmaxdata.data[3] >
                      session.findmaxdata.data[session.findmaxdata.maxidx]
                    ) {
                      session.findmaxdata.maxidx = 3;
                    }
                  }
                  if (getSteps(message, "第四次比较")) {
                    session.findmaxdata.compareidx = 4;
                    const findmaxprops4: Props = {
                      type: "findmax",
                      data: session.findmaxdata.data,
                      maxidx: session.findmaxdata.maxidx,
                      compareidx: session.findmaxdata.compareidx,
                      messageId: botMessage.id,

                      newData: [],
                      number: -1,
                    };
                    botMessage.animation = findmaxprops4;
                    if (
                      session.findmaxdata.data[4] >
                      session.findmaxdata.data[session.findmaxdata.maxidx]
                    ) {
                      session.findmaxdata.maxidx = 4;
                    }
                  }
                }
              }
              if (
                session.mask.name == "SearchNumber" ||
                session.mask.name == "SearchNumber/EN"
              ) {
                const contains5list = contains5ElementList(message);
                if (contains5list) {
                  const _5list = extractArrayFromString(message);
                  const _5list_s = Array.isArray(_5list) ? _5list : [];
                  console.log(
                    "现在 session.searchnumberdata.animationshowed = ",
                    session.searchnumberdata.animationshowed,
                  );
                  if (session.searchnumberdata.animationshowed === 0) {
                    console.log("contains5list: ", _5list_s);
                    session.searchnumberdata.data = _5list_s;
                  } else if (session.searchnumberdata.animationshowed === 1) {
                    if (!_5list_s.includes(5)) {
                      console.log("不包含5的list: ", _5list_s);
                      session.searchnumberdata.data = _5list_s;
                      session.searchnumberdata.animationshowed = 2;
                    }
                  }
                }
                let searchnumberprops: Props = {
                  type: "searchnumber",
                  data: session.searchnumberdata.data,
                  number: 5,
                  messageId: botMessage.id,

                  maxidx: -1,
                  compareidx: -1,
                  newData: [],
                };
                if (
                  session.searchnumberdata.animationshowed === 0 &&
                  contains5list &&
                  session.searchnumberdata.data.length === 5
                ) {
                  botMessage.animation = searchnumberprops;
                  session.searchnumberdata.animationshowed = 1;
                } else if (
                  session.searchnumberdata.animationshowed === 2 &&
                  session.searchnumberdata.data.length === 5
                ) {
                  botMessage.animation = searchnumberprops;
                  session.searchnumberdata.animationshowed = 3;
                } else {
                  botMessage.animation = emptyprops;
                }
              }
              get().onNewMessage(botMessage);
            }
            ChatControllerPool.remove(session.id, botMessage.id);
          },
          onError(error) {
            const isAborted = error.message.includes("aborted");
            botMessage.content +=
              "\n\n" +
              prettyObject({
                error: true,
                message: error.message,
              });
            botMessage.streaming = false;
            userMessage.isError = !isAborted;
            botMessage.isError = !isAborted;
            get().updateCurrentSession((session) => {
              session.messages = session.messages.concat();
            });
            ChatControllerPool.remove(
              session.id,
              botMessage.id ?? messageIndex,
            );

            console.error("[Chat] failed ", error);
          },
          onController(controller) {
            // collect controller for stop/retry
            ChatControllerPool.addController(
              session.id,
              botMessage.id ?? messageIndex,
              controller,
            );
          },
        });
      },

      getMemoryPrompt() {
        const session = get().currentSession();

        return {
          role: "system",
          content:
            session.memoryPrompt.length > 0
              ? Locale.Store.Prompt.History(session.memoryPrompt)
              : "",
          date: "",
        } as ChatMessage;
      },

      getMessagesWithMemory() {
        const session = get().currentSession();
        const modelConfig = session.mask.modelConfig;
        const clearContextIndex = session.clearContextIndex ?? 0;
        const messages = session.messages.slice();
        const totalMessageCount = session.messages.length;

        // in-context prompts
        const contextPrompts = session.mask.context.slice();

        // system prompts, to get close to OpenAI Web ChatGPT
        const shouldInjectSystemPrompts = modelConfig.enableInjectSystemPrompts;
        const systemPrompts = shouldInjectSystemPrompts
          ? [
              createMessage({
                role: "system",
                content: fillTemplateWith("", {
                  ...modelConfig,
                  template: DEFAULT_SYSTEM_TEMPLATE,
                }),
              }),
            ]
          : [];
        if (shouldInjectSystemPrompts) {
          console.log(
            "[Global System Prompt] ",
            systemPrompts.at(0)?.content ?? "empty",
          );
        }

        // long term memory
        const shouldSendLongTermMemory =
          modelConfig.sendMemory &&
          session.memoryPrompt &&
          session.memoryPrompt.length > 0 &&
          session.lastSummarizeIndex > clearContextIndex;
        const longTermMemoryPrompts = shouldSendLongTermMemory
          ? [get().getMemoryPrompt()]
          : [];
        const longTermMemoryStartIndex = session.lastSummarizeIndex;

        // short term memory
        const shortTermMemoryStartIndex = Math.max(
          0,
          totalMessageCount - modelConfig.historyMessageCount,
        );

        // lets concat send messages, including 4 parts:
        // 0. system prompt: to get close to OpenAI Web ChatGPT
        // 1. long term memory: summarized memory messages
        // 2. pre-defined in-context prompts
        // 3. short term memory: latest n messages
        // 4. newest input message
        const memoryStartIndex = shouldSendLongTermMemory
          ? Math.min(longTermMemoryStartIndex, shortTermMemoryStartIndex)
          : shortTermMemoryStartIndex;
        // and if user has cleared history messages, we should exclude the memory too.
        const contextStartIndex = Math.max(clearContextIndex, memoryStartIndex);
        const maxTokenThreshold = modelConfig.max_tokens;

        // get recent messages as much as possible
        const reversedRecentMessages = [];
        for (
          let i = totalMessageCount - 1, tokenCount = 0;
          i >= contextStartIndex && tokenCount < maxTokenThreshold;
          i -= 1
        ) {
          const msg = messages[i];
          if (!msg || msg.isError) continue;
          tokenCount += estimateTokenLength(msg.content);
          reversedRecentMessages.push(msg);
        }

        // concat all messages
        const recentMessages = [
          ...systemPrompts,
          ...longTermMemoryPrompts,
          ...contextPrompts,
          ...reversedRecentMessages.reverse(),
        ];

        return recentMessages;
      },

      updateMessage(
        sessionIndex: number,
        messageIndex: number,
        updater: (message?: ChatMessage) => void,
      ) {
        const sessions = get().sessions;
        const session = sessions.at(sessionIndex);
        const messages = session?.messages;
        updater(messages?.at(messageIndex));
        set(() => ({ sessions }));
      },

      resetSession() {
        get().updateCurrentSession((session) => {
          session.messages = [];
          session.memoryPrompt = "";
        });
      },

      summarizeSession() {
        const config = useAppConfig.getState();
        const session = get().currentSession();

        // remove error messages if any
        const messages = session.messages;

        // should summarize topic after chating more than 50 words
        const SUMMARIZE_MIN_LEN = 50;
        if (
          config.enableAutoGenerateTitle &&
          session.topic === DEFAULT_TOPIC &&
          countMessages(messages) >= SUMMARIZE_MIN_LEN
        ) {
          const topicMessages = messages.concat(
            createMessage({
              role: "user",
              content: Locale.Store.Prompt.Topic,
            }),
          );
          api.llm.chat({
            messages: topicMessages,
            config: {
              model: getSummarizeModel(session.mask.modelConfig.model),
            },
            onFinish(message) {
              get().updateCurrentSession(
                (session) =>
                  (session.topic =
                    message.length > 0 ? trimTopic(message) : DEFAULT_TOPIC),
              );
            },
          });
        }

        const modelConfig = session.mask.modelConfig;
        const summarizeIndex = Math.max(
          session.lastSummarizeIndex,
          session.clearContextIndex ?? 0,
        );
        let toBeSummarizedMsgs = messages
          .filter((msg) => !msg.isError)
          .slice(summarizeIndex);

        const historyMsgLength = countMessages(toBeSummarizedMsgs);

        if (historyMsgLength > modelConfig?.max_tokens ?? 4000) {
          const n = toBeSummarizedMsgs.length;
          toBeSummarizedMsgs = toBeSummarizedMsgs.slice(
            Math.max(0, n - modelConfig.historyMessageCount),
          );
        }

        // add memory prompt
        toBeSummarizedMsgs.unshift(get().getMemoryPrompt());

        const lastSummarizeIndex = session.messages.length;

        console.log(
          "[Chat History] ",
          toBeSummarizedMsgs,
          historyMsgLength,
          modelConfig.compressMessageLengthThreshold,
        );

        if (
          historyMsgLength > modelConfig.compressMessageLengthThreshold &&
          modelConfig.sendMemory
        ) {
          api.llm.chat({
            messages: toBeSummarizedMsgs.concat(
              createMessage({
                role: "system",
                content: Locale.Store.Prompt.Summarize,
                date: "",
              }),
            ),
            config: {
              ...modelConfig,
              stream: true,
              model: getSummarizeModel(session.mask.modelConfig.model),
            },
            onUpdate(message) {
              session.memoryPrompt = message;
            },
            onFinish(message) {
              console.log("[Memory] ", message);
              session.lastSummarizeIndex = lastSummarizeIndex;
            },
            onError(err) {
              console.error("[Summarize] ", err);
            },
          });
        }
      },

      updateStat(message: ChatMessage) {
        get().updateCurrentSession((session) => {
          session.stat.charCount += message.content.length;
          // TODO: should update chat count and word count
        });
      },

      updateCurrentSession(updater: (session: ChatSession) => void) {
        const sessions = get().sessions;
        const index = get().currentSessionIndex;
        updater(sessions[index]);
        set(() => ({ sessions }));
      },

      clearAllData() {
        localStorage.clear();
        location.reload();
      },
    };

    return methods;
  },
  {
    name: StoreKey.Chat,
    version: 3.1,
    migrate(persistedState, version) {
      const state = persistedState as any;
      const newState = JSON.parse(
        JSON.stringify(state),
      ) as typeof DEFAULT_CHAT_STATE;

      if (version < 2) {
        newState.sessions = [];

        const oldSessions = state.sessions;
        for (const oldSession of oldSessions) {
          const newSession = createEmptySession();
          newSession.topic = oldSession.topic;
          newSession.messages = [...oldSession.messages];
          newSession.mask.modelConfig.sendMemory = true;
          newSession.mask.modelConfig.historyMessageCount = 4;
          newSession.mask.modelConfig.compressMessageLengthThreshold = 1000;
          newState.sessions.push(newSession);
        }
      }

      if (version < 3) {
        // migrate id to nanoid
        newState.sessions.forEach((s) => {
          s.id = nanoid();
          s.messages.forEach((m) => (m.id = nanoid()));
        });
      }

      // Enable `enableInjectSystemPrompts` attribute for old sessions.
      // Resolve issue of old sessions not automatically enabling.
      if (version < 3.1) {
        newState.sessions.forEach((s) => {
          if (
            // Exclude those already set by user
            !s.mask.modelConfig.hasOwnProperty("enableInjectSystemPrompts")
          ) {
            // Because users may have changed this configuration,
            // the user's current configuration is used instead of the default
            const config = useAppConfig.getState();
            s.mask.modelConfig.enableInjectSystemPrompts =
              config.modelConfig.enableInjectSystemPrompts;
          }
        });
      }

      return newState as any;
    },
  },
);
