import { reactive, watch } from "vue";
const eventBus = reactive({});

export const emitEvent = (event, data) => {
  eventBus[event] = data;
};

export const onEvent = (event, callback) => {
  watch(() => eventBus[event], callback);
};
