import test from "ava";
import { interpret } from "xstate";
import NavigatorMachine from "../source/libs/components/frame/navigator.machine";

test("validate navigation history entries", (t) => {
  let state = NavigatorMachine.transition("historyLoaded", {
    type: "UPDATE_HISTORY",
    payload: {
      url: "https://www.google.com/",
    }
  });
  t.is(state.context.currentURL, "https://www.google.com/");
  t.is(state.context.currentIndex, 0);
  t.assert(state.context.currentRecords.indexOf("https://www.google.com/") === 0);

  state = NavigatorMachine.transition("historyLoaded", {
    type: "UPDATE_HISTORY",
    payload: {
      url: "https://web.archive.org/web/20171231183454/https://www.google.com/",
    }
  }, {
    ...state.context
  });
  t.is(state.context.currentURL, "https://web.archive.org/web/20171231183454/https://www.google.com/");
  t.is(state.context.currentIndex, 1);
  t.assert(state.context.currentRecords.indexOf("https://web.archive.org/web/20171231183454/https://www.google.com/") === 1);
});

test("validate navigation history entries [intrepret]", (t) => new Promise(((resolve) => {
  let loaded = false;
  let loadedOne = false;
  let loadedTwo = false;
  let isForward = false;

  const navService = interpret(NavigatorMachine.withConfig({
    actions: {
      navigateToURL: () => {},
      navigateBack: () => {}
    }
  })).onTransition((state, event) => {
    if (!loaded && state.matches("historyLoaded")) {
      loaded = true;
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://www.google.com/",
          meta: { test: true }
        }
      });
    } else if (!loadedOne && event.type === "UPDATE_HISTORY") {
      loadedOne = true;
      t.is(state.context.currentURL, "https://www.google.com/");
      t.is(state.context.currentIndex, 0);
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://web.archive.org/web/20171231183454/https://www.google.com/",
          meta: { test: true }
        }
      });
    } else if (!loadedTwo && event.type === "UPDATE_HISTORY") {
      loadedTwo = true;
      t.is(state.context.currentIndex, 1);
      t.deepEqual(state.context.currentRecords, [
        "https://www.google.com/",
        "https://web.archive.org/web/20171231183454/https://www.google.com/"
      ]);
      t.is(state.context.currentURL, "https://web.archive.org/web/20171231183454/https://www.google.com/");
      navService.send("UPDATE_HISTORY_ONCOMMIT", {
        payload: {
          url: "https://www.google.com/",
          type: "manual",
          meta: { test: true }
        }
      });
    } else if (event.type === "UPDATE_HISTORY_ONCOMMIT") {
      t.is(state.context.currentIndex, 2);
      t.deepEqual(state.context.currentRecords, [
        "https://www.google.com/",
        "https://web.archive.org/web/20171231183454/https://www.google.com/",
        "https://www.google.com/"
      ]);
      navService.send("GO_BACK");
    } else if (event.type === "GO_BACK") {
      t.is(state.context.currentURL, "https://web.archive.org/web/20171231183454/https://www.google.com/");
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://web.archive.org/web/20171231183454/https://www.google.com/",
          meta: { test: true }
        }
      });
      navService.send("GO_FORWARD");
    } else if (event.type === "GO_FORWARD") {
      isForward = true;
      t.is(state.context.currentIndex, 1);
      t.is(state.context.currentURL, "https://www.google.com/");
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://www.google.com/",
          meta: { test: true }
        }
      });
    } else if (isForward && event.type === "UPDATE_HISTORY") {
      isForward = false;
      t.is(state.context.currentIndex, 2);
      resolve();
    }
  });
  navService.start();
})));

test("validate auto navigation entries [interpret]", (t) => new Promise(((resolve) => {
  let loaded = false;
  let loadedOne = false;
  let loadedTwo = false;
  let loadedThree = false;
  let loadedFour = false;

  const navService = interpret(NavigatorMachine.withConfig({
    actions: {
      updateVandalURL: () => {}
    }
  })).onTransition((state, event) => {
    if (!loaded && state.matches("historyLoaded")) {
      loaded = true;
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://www.google.com/",
          meta: { test: true }
        }
      });
    } else if (!loadedOne && event.type === "UPDATE_HISTORY") {
      loadedOne = true;
      t.deepEqual(state.context.currentRecords, [
        "https://www.google.com/"
      ]);
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://web.archive.org/web/20171231183454/https://www.google.com/",
          meta: { test: true }
        }
      });
    } else if (!loadedTwo && event.type === "UPDATE_HISTORY") {
      loadedTwo = true;
      t.deepEqual(state.context.currentRecords, [
        "https://www.google.com/",
        "https://web.archive.org/web/20171231183454/https://www.google.com/"
      ]);
      t.is(state.context.currentIndex, 1);
      navService.send("UPDATE_HISTORY_ONCOMMIT", {
        payload: {
          url: "https://www.google.com/",
          type: "auto",
          meta: { test: true }
        }
      });
    } else if (event.type === "UPDATE_HISTORY_ONCOMMIT") {
      t.deepEqual(state.context.currentRecords, [
        "https://www.google.com/",
        "https://web.archive.org/web/20171231183454/https://www.google.com/"
      ]);
      t.is(state.context.currentIndex, 0);
      // history change
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://web.archive.org/web/20171231183454/https://www.google.com/",
          type: "auto",
          meta: { test: true }
        }
      });
    } else if (!loadedThree && event.type === "UPDATE_HISTORY") {
      loadedThree = true;
      t.deepEqual(state.context.currentRecords, [
        "https://www.google.com/",
        "https://web.archive.org/web/20171231183454/https://www.google.com/"
      ]);
      t.is(state.context.currentIndex, 1);
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://www.google.com/",
          type: "auto",
          meta: { test: true }
        }
      });
    } else if (!loadedFour && event.type === "UPDATE_HISTORY") {
      loadedFour = true;
      t.deepEqual(state.context.currentRecords, [
        "https://www.google.com/",
        "https://web.archive.org/web/20171231183454/https://www.google.com/"
      ]);
      t.is(state.context.currentIndex, 0);
      resolve();
    }
  });
  navService.start();
})));

test("validate redirect [interpret]", (t) => new Promise(((resolve) => {
  let loaded = false;
  let loadedOne = false;
  let loadedTwo = false;

  const navService = interpret(NavigatorMachine.withConfig({
    actions: {
      updateVandalURL: () => {}
    }
  })).onTransition((state, event) => {
    if (!loaded && state.matches("historyLoaded")) {
      loaded = true;
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://www.google.com/",
          meta: { test: true }
        }
      });
    } else if (!loadedOne && event.type === "UPDATE_HISTORY") {
      loadedOne = true;
      t.deepEqual(state.context.currentRecords, [
        "https://www.google.com/"
      ]);
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://web.archive.org/web/20171231183454/https://www.google.com/",
          meta: { test: true }
        }
      });
    } else if (!loadedTwo && event.type === "UPDATE_HISTORY") {
      loadedTwo = true;
      t.deepEqual(state.context.currentRecords, [
        "https://www.google.com/",
        "https://web.archive.org/web/20171231183454/https://www.google.com/"
      ]);
      t.is(state.context.currentIndex, 1);
      navService.send("UPDATE_HISTORY_ONCOMMIT", {
        payload: {
          url: "https://web.archive.org/web/20171231183457/https://www.google.com/",
          type: "redirect",
          meta: { test: true }
        }
      });
    } else if (event.type === "UPDATE_HISTORY_ONCOMMIT") {
      t.deepEqual(state.context.currentRecords, [
        "https://www.google.com/",
        "https://web.archive.org/web/20171231183457/https://www.google.com/"
      ]);
      t.is(state.context.currentIndex, 1);
      resolve();
    }
  });
  navService.start();
})));

test("validate auto redirect with new URL's [interpret]", (t) => new Promise(((resolve) => {
  let loaded = false;
  let loadedOne = false;
  let loadedTwo = false;

  const navService = interpret(NavigatorMachine.withConfig({
    actions: {
      updateVandalURL: () => {}
    }
  })).onTransition((state, event) => {
    if (!loaded && state.matches("historyLoaded")) {
      loaded = true;
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://medium.com/",
          meta: { test: true }
        }
      });
    } else if (!loadedOne && event.type === "UPDATE_HISTORY") {
      loadedOne = true;
      t.deepEqual(state.context.currentRecords, [
        "https://medium.com/"
      ]);
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://medium.com/mind-cafe/three-things-in-life-that-arent-worth-the-effort-d9b536f91c2?source=extreme_main_feed---------4-73--------------------a9c4de03_e2ed_4835_a5b7_b30afb484541-------",
          meta: { test: true }
        }
      });
    } else if (!loadedTwo && event.type === "UPDATE_HISTORY") {
      loadedTwo = true;
      t.deepEqual(state.context.currentRecords, [
        "https://medium.com/",
        "https://medium.com/mind-cafe/three-things-in-life-that-arent-worth-the-effort-d9b536f91c2?source=extreme_main_feed---------4-73--------------------a9c4de03_e2ed_4835_a5b7_b30afb484541-------"
      ]);
      t.is(state.context.currentIndex, 1);
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://medium.com/mind-cafe/three-things-in-life-that-arent-worth-the-effort",
          type: "auto",
          meta: { test: true }
        }
      });
    } else if (event.type === "UPDATE_HISTORY") {
      t.deepEqual(state.context.currentRecords, [
        "https://medium.com/",
        "https://medium.com/mind-cafe/three-things-in-life-that-arent-worth-the-effort"
      ]);
      t.is(state.context.currentIndex, 1);
      resolve();
    }
  });
  navService.start();
})));

test.only("validate auto navigation with _if", (t) => new Promise(((resolve) => {
  let loaded = false;
  let loadedOne = false;
  let loadedTwo = false;

  const navService = interpret(NavigatorMachine.withConfig({
    actions: {
      updateVandalURL: () => {}
    }
  })).onTransition((state, event) => {
    if (!loaded && state.matches("historyLoaded")) {
      loaded = true;
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://www.example.com/",
          meta: { test: true }
        }
      });
    } else if (!loadedOne && event.type === "UPDATE_HISTORY") {
      loadedOne = true;
      t.deepEqual(state.context.currentRecords, [
        "https://www.example.com/"
      ]);
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://web.archive.org/web/20171231183457/https://www.example.com/",
          meta: { test: true }
        }
      });
      resolve();
    } else if (!loadedTwo && event.type === "UPDATE_HISTORY") {
      loadedTwo = true;
      t.deepEqual(state.context.currentRecords, [
        "https://www.example.com/",
        "https://web.archive.org/web/20171231183457/https://www.example.com/"
      ]);
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://web.archive.org/web/20171231183456/https://www.example.com/",
          meta: { test: true }
        }
      });
    } else if (!loadedTwo && event.type === "UPDATE_HISTORY") {
      loadedTwo = true;
      t.deepEqual(state.context.currentRecords, [
        "https://www.example.com/",
        "https://web.archive.org/web/20171231183457/https://www.example.com/",
        "https://web.archive.org/web/20171231183456/https://www.example.com/"
      ]);
      navService.send("UPDATE_HISTORY_ONCOMMIT", {
        payload: {
          url: "https://web.archive.org/web/20171231183457if_/https://www.example.com/",
          type: "auto",
          meta: { test: true }
        }
      });
      resolve();
    } else if (event.type === "UPDATE_HISTORY_ONCOMMIT") {
      t.deepEqual(state.context.currentRecords, [
        "https://www.example.com/",
        "https://web.archive.org/web/20171231183457/https://www.example.com/",
        "https://web.archive.org/web/20171231183456/https://www.example.com/"
      ]);
      t.is(state.context.currentURL, "https://web.archive.org/web/20171231183457/https://www.example.com/");
      t.is(state.context.currentIndex, 1);
      resolve();
    }
  });
  navService.start();
})));

test.only("reset index on auto if no immediate match found", (t) => new Promise(((resolve) => {
  let loaded = false;
  let loadedOne = false;
  let loadedTwo = false;

  const navService = interpret(NavigatorMachine.withConfig({
    actions: {
      updateVandalURL: () => {}
    }
  })).onTransition((state, event) => {
    if (!loaded && state.matches("historyLoaded")) {
      loaded = true;
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://www.example.com/",
          meta: { test: true }
        }
      });
    } else if (!loadedOne && event.type === "UPDATE_HISTORY") {
      loadedOne = true;
      t.deepEqual(state.context.currentRecords, [
        "https://www.example.com/"
      ]);
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://www.example.com/blog/",
          meta: { test: true }
        }
      });
      resolve();
    } else if (!loadedTwo && event.type === "UPDATE_HISTORY") {
      loadedTwo = true;
      t.deepEqual(state.context.currentRecords, [
        "https://www.example.com/",
        "https://www.example.com/blog/"
      ]);
      navService.send("UPDATE_HISTORY", {
        payload: {
          url: "https://web.archive.org/web/20171231183456/https://www.example.com/blog/",
          meta: { test: true }
        }
      });
    } else if (!loadedTwo && event.type === "UPDATE_HISTORY") {
      loadedTwo = true;
      t.deepEqual(state.context.currentRecords, [
        "https://www.example.com/",
        "https://www.example.com/blog/",
        "https://web.archive.org/web/20171231183456/https://www.example.com/"
      ]);
      navService.send("UPDATE_HISTORY_ONCOMMIT", {
        payload: {
          url: "https://www.example.com/",
          type: "auto",
          meta: { test: true }
        }
      });
      resolve();
    } else if (event.type === "UPDATE_HISTORY_ONCOMMIT") {
      t.deepEqual(state.context.currentRecords, [
        "https://www.example.com/",
        "https://web.archive.org/web/20171231183457/https://www.example.com/",
        "https://web.archive.org/web/20171231183456/https://www.example.com/"
      ]);
      t.is(state.context.currentURL, "https://www.example.com/");
      t.is(state.context.currentIndex, 0);
      resolve();
    }
  });
  navService.start();
})));
