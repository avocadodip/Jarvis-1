const OpenAI = require("openai");
const Agent = require("./Agent");
const { input } = require("./util/util");

async function run() {
  const openai = new OpenAI({
    apiKey: "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"
  });
  const jarvis = new Agent(openai);
  await jarvis.init(); // Initialize Puppeteer and open a new page
  let isAnswerFound = false;

  while (true) {
    const userInput = await input("You: ");
    await jarvis.storeMessageToMemory(userInput);

    while (!isAnswerFound) {
      const { thoughtProcess, nextAction } = await jarvis.startEvaluation();
      console.log("🤖 Jarvis: " + thoughtProcess);

      switch (nextAction.action) {
        case "visit-url":
          await jarvis.goToUrl(nextAction.url);
          await jarvis.labelPage();
          await jarvis.takeScreenShot();
          break;
        case "click":
          await jarvis.click(nextAction.element);
          break;
        case "type":
          await jarvis.type(nextAction.element, nextAction.text);
          break;
        case "request-info":
          console.log(`✋ Hol' up. Need some clarification: ${nextAction.prompt}`);
          const userInput = await input("You: ");
          await jarvis.storeMessageToMemory(userInput);
          break;
        case "remember-info":
          break;
        case "done":
          console.log("✅ Yippeee I finished this task");
          isAnswerFound = true;
          break;
        case "give-up":
          console.log("❌ Wah Wah. Had to give up.");
          isAnswerFound = false;
          break;
      }
    }
  }
}

run().catch(console.error);
