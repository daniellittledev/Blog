---
author: "Daniel Little"
date: 2017-10-16T05:21:53Z
description: ""
draft: true
path: "/redux-saga-error-handling-and-authentication"
title: "Redux Saga error handling and authentication"

---

```
* runTask(func, title, ...args) {
  yield put(actions.taskStarted({ title: title }));
  try {
    const result = yield call(func, ...args);
    return result;
  } finally {
    yield put(actions.taskSucceeded());
  }
}
```

Yeah

```

export class Sagas {

  constructor(api) {
    this.api = api
  }

  * homeSaga() {
    while(true) {
      yield take([actions.NavigateHome.getType());
      const response = yield runTask("Loading home", this.api.getHome);
      // Handle success and or failure
      }
    }
  }

}

```

Yeah

```
const rootSagaProvider = function rootSagaProvider(api) {
  let saga = new Sagas(api);

  return (function * rootSaga() {
    try {

      yield runSafely(function* innerRootSaga() {
        console.log("Sagas starting");
        const topLevelSagas = [
          saga.startupSaga,
          saga.authenticationSaga,
          saga.chooseProfileTypeSaga,
          saga.profileUpdatedSaga,
          saga.homeSaga
        ].map(saga => call(runSafely(saga)));

        yield all(topLevelSagas);
      });

    } catch (ex) {
      console.error("OhNo! " + ex + "\n" + e.stack);
    }
  });

};

export default rootSagaProvider;
```