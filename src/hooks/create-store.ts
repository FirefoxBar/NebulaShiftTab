import { createContext,useContext } from "react";

export const createStore = <T>(creator: () => T) => {

  const context = createContext<T>({} as T);

  return {
    useStore: () => useContext(context),
    Provider: context.Provider,
    createStore: () => {
      const store = creator();
      return {
        useStore: () => {
          return store;
        },
        Provider: context.Provider,
      };
    },

  }
};
